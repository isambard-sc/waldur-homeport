import { FunctionComponent } from 'react';

import { SVGImagePlaceholder } from '@waldur/core/SVGImagePlaceholder';
interface LogoProps {
  image: string;
  placeholder: string;
  height: number;
  width: number;
}

export const Logo: FunctionComponent<LogoProps> = (props) =>
  props.image ? (
    <img src={props.image} alt="logo" height={props.height} width="auto" />
  ) : (
    <SVGImagePlaceholder
      width={props.width}
      height={props.height}
      text={props.placeholder}
      fontSize={60}
    />
  );
