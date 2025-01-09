import { ENV } from '@waldur/configs/default';
import { get, sendForm } from '@waldur/core/api';
import { UserDetails, Project } from '@waldur/workspace/types';

import { UserInfo, ProjectInfo } from './types';

export function getUserInfo(user: UserDetails): Promise<UserInfo> {
  return get<UserInfo>(`openportal-userinfo/?user=${user.url}/`).then((response) => response.data);
}

export function getProjectInfo(project: Project): Promise<ProjectInfo> {
  return get<ProjectInfo>(`openportal-projectinfo/?project=${project.url}/`).then((response) => response.data);
}

export function setUserInfo(userinfo: UserInfo) {
  return sendForm('POST', 'openportal-userinfo/', userinfo);
}

export function setProjectInfo(projectinfo: ProjectInfo) {
  return sendForm('POST', 'openportal-projectinfo/', projectinfo);
}
