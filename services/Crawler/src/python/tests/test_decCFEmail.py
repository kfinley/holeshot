def test_decCFEmail():

    from commands.decode_emails import decCFEmail

    assert decCFEmail(
        '3a53545c55145857427a59534e43555c485559515253565614595557') == 'info.bmx@cityofrockhill.com'
