import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { AttributeCell } from './AttributeCell';
import {
  ListAttribute,
  ChoiceAttribute,
  BooleanAttribute,
  StringAttribute,
} from './AttributeCell.fixtures';

describe('AttributeCell', () => {
  it('renders list attribute', () => {
    const wrapper = render(
      <AttributeCell attr={ListAttribute} value={['E5-2650v3', 'E5-2680v3']} />,
    );
    expect(wrapper.container).toMatchSnapshot();
  });

  it('renders choice attribute', () => {
    const wrapper = render(
      <AttributeCell attr={ChoiceAttribute} value="gpu_NVidia_K80" />,
    );
    expect(wrapper.container).toMatchSnapshot();
  });

  it('renders invalid choice attribute', () => {
    const wrapper = render(
      <AttributeCell attr={ChoiceAttribute} value="invalid" />,
    );
    expect(wrapper.container).toMatchSnapshot();
  });

  it('renders boolean value', () => {
    const wrapper = render(
      <AttributeCell attr={BooleanAttribute} value={true} />,
    );
    expect(wrapper.container).toMatchSnapshot();
  });

  it('renders negative boolean value', () => {
    const wrapper = render(
      <AttributeCell attr={BooleanAttribute} value={false} />,
    );
    expect(wrapper.container).toMatchSnapshot();
  });

  it('renders string attribute', () => {
    const wrapper = render(
      <AttributeCell attr={StringAttribute} value="/opt/" />,
    );
    expect(wrapper.container).toMatchSnapshot();
  });
});
