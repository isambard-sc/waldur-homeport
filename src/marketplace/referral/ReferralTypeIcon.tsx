import {
  Calendar,
  Database,
  Folders,
  HardDrives,
  YoutubeLogo,
  Image,
  UsersThree,
  CubeFocus,
  Laptop,
  TreeStructure,
  FileText,
  SealQuestion,
  Microphone,
  Ambulance,
  Copy,
  SignOut,
} from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';

interface ReferralTypeIconProps {
  resourceType: string;
}

const Components = {
  Audiovisual: YoutubeLogo,
  Collection: Folders,
  DataPaper: HardDrives,
  Dataset: Database,
  Event: Calendar,
  Image,
  InteractiveResource: UsersThree,
  Model: Copy,
  PhysicalObject: CubeFocus,
  Service: Ambulance,
  Software: Laptop,
  Sound: Microphone,
  Text: FileText,
  Workflow: TreeStructure,
  Other: SignOut,
  Default: SealQuestion,
};

export const ReferralTypeIcon: FunctionComponent<ReferralTypeIconProps> = (
  props,
) => {
  /* Available values of resource type:
   * https://schema.datacite.org/meta/kernel-4.1/include/datacite-resourceType-v4.1.xsd
   */
  const Component = Components[props.resourceType] || Components.Default;
  return (
    <Tip label={props.resourceType} id="resource-type-label">
      <Component />
    </Tip>
  );
};
