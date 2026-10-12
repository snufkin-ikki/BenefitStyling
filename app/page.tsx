import { landingMarkup } from "./landing-markup";
import { employerVisuals } from "./employer-visuals";
export default function Home(){
  const markup = landingMarkup.replace('<section class="section intro"', `${employerVisuals}<section class="section intro"`);
  return <div dangerouslySetInnerHTML={{__html:markup}}/>;
}
