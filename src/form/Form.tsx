import { InjectedFormProps, reduxForm } from 'redux-form';

type Children =
  | string
  | JSX.Element
  | JSX.Element[]
  | ((props: Omit<InjectedFormProps, 'handleSubmit'>) => JSX.Element);

export const Form = reduxForm<
  {},
  { onSubmit?; children: Children; className?: string }
>({})(({ handleSubmit, onSubmit, children, className, ...rest }) => (
  <form
    onSubmit={onSubmit ? handleSubmit(onSubmit) : null}
    className={className}
  >
    {typeof children === 'function' ? children(rest) : children}
  </form>
));
