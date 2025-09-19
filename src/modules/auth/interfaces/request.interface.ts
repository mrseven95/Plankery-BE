import { IUser } from '../../user/interfaces/user.interface';

export interface AuthenticatedRequest {
  user: IUser;
}
