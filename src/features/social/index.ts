/**
 * Publieke ingang van de social-feature (BOUWPROMPT §4).
 */
export {
  haalSocialBerichten,
  beeldUrl,
  type SocialBericht,
} from "./server/queries";

export {
  DOELEN,
  PLATFORMS,
  DOEL_LABEL,
  PLATFORM_LABEL,
  type SocialDoel,
  type SocialPlatform,
} from "./opties";

export { metaIngericht } from "./server/meta";

export { SocialWerkblad } from "./components/social-werkblad";
export { BerichtActies } from "./components/bericht-acties";
