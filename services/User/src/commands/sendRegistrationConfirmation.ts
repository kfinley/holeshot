
import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';
import { SES } from "@aws-sdk/client-ses";

//TODO: do this smarter
const HOLESHOT_SITE_URL = process.env.HOLESHOT_SITE_URL as string;
const HOLESHOT_SENDER_EMAIL = process.env.HOLESHOT_SENDER_EMAIL as string;
const HOLESHOT_CONFIRMATION_EMAIL_TEMPLATE = process.env.HOLESHOT_CONFIRMATION_EMAIL_TEMPLATE as string;

export interface SendConfirmationRequest {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  tempPassword: string;
}

export interface SendConfirmationResponse {
  success: boolean
}

@injectable()
export class SendConfirmationCommand implements Command<SendConfirmationRequest, SendConfirmationResponse> {

  @Inject("SES")
  private emailService: SES;

  private generateUrl = (baseUri: string, userId: string, password: string) =>
    `${baseUri}/set-password?regCode=${userId}|${encodeURI(password)}`;

  async runAsync(params: SendConfirmationRequest): Promise<SendConfirmationResponse> {

    const templateData = {
      FirstName: params.firstName,
      Url: this.generateUrl(HOLESHOT_SITE_URL, params.userId, params.tempPassword)
    };

    console.log('settings', { HOLESHOT_SITE_URL, HOLESHOT_SENDER_EMAIL, HOLESHOT_CONFIRMATION_EMAIL_TEMPLATE });

    try {
      var result = await this.emailService.sendTemplatedEmail({
        Source: HOLESHOT_SENDER_EMAIL,
        Template: HOLESHOT_CONFIRMATION_EMAIL_TEMPLATE,
        Destination: {
          ToAddresses: [
            params.email
          ],
        },
        TemplateData: JSON.stringify(templateData),
      });

      console.log('result', result);

      return {
        success: result.$metadata.httpStatusCode == 200
      }
    }
    catch (e) {
      console.log('Error in sendRegistrationConfirmation', e);
      return {
        success: false
      }
    }
  }
}
