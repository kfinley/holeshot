import { Vue, Prop } from "vue-property-decorator";

export default class BaseControl extends Vue {
  getDay = (d: Date) => d.getDay();
  monthName = new Intl.DateTimeFormat("en-US", { month: "short" }).format;
  weekdayName = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format;
  toSentence = (s: string) =>
    s.charAt(0).toUpperCase() +
    s
      .slice(1)
      .replace(/([A-Z]+)/g, " $1")
      .replace(/([A-Z][a-z])/g, " $1");


  @Prop({ default: "85%" })
  maxWidth!: string;

  get disconnected() {
    return (this.$store as any).state.WebSockets?.status != "Connected";
  }
}
