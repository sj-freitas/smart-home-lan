import { FiHome, FiMusic, FiTv, FiWind } from "react-icons/fi";
import { LampIcon } from "./lamp.icon";
import { CeilingLightIcon } from "./ceiling-light.icon";
import { DeskLampIcon } from "./desk-lamp.icon";
import { CeilingLampIcon } from "./ceiling-lamp.icon";
import { AirConditionerIcon } from "./air-conditioner.icon";
import { FanIcon } from "./fan.icon";
import { PanIcon } from "./pan.icon";
import { SofaIcon } from "./sofa.icon";
import { DoubleBedIcon } from "./double-bed.icon";
import { SingleBedIcon } from "./single-bed.icon";

export function getIconFromId(icon?: string, size: string = "18") {
  if (!icon) {
    return <FiHome size={size} />;
  }
  switch (icon) {
    case "wind":
      return <FiWind size={size} />;
    case "lamp":
      return <LampIcon size={size} />;
    case "music_note":
      return <FiMusic size={size} />;
    case "television":
      return <FiTv size={size} />;
    case "ceiling_light":
      return <CeilingLightIcon size={size} />;
    case "desk_lamp":
      return <DeskLampIcon size={size} />;
    case "ceiling_lamp":
      return <CeilingLampIcon size={size} />;
    case "sofa":
      return <SofaIcon size={size} />;
    case "single_bed":
      return <SingleBedIcon size={size} />;
    case "double_bed":
      return <DoubleBedIcon size={size} />;
    case "pan":
      return <PanIcon size={size} />;
    case "air_conditioner":
      return <AirConditionerIcon size={size} />;
    case "fan":
      return <FanIcon size={size} />;
    default:
      return <FiHome size={size} />;
  }
}
