import { createRoot } from 'react-dom/client';

import './vendor';
import './sass/noscript.scss';
import { Application } from './Application';

import './support/module';
import './openstack/module';
import './rancher/module';
import './slurm/module';
import './azure/module';
import './booking/marketplace';
import './marketplace-script/marketplace';
import './marketplace-remote/marketplace';
import './vmware/module';

const domNode = document.getElementById('react-root');
const root = createRoot(domNode);
root.render(<Application />);
