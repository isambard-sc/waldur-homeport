import customerDetailsSaga from '@waldur/customer/details/store/effects';
import { effects as titleEffects } from '@waldur/navigation/title';
import workspaceSaga from '@waldur/workspace/effects';

export default [customerDetailsSaga, titleEffects, workspaceSaga];
