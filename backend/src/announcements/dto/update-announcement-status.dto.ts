import { IsIn } from 'class-validator';
import type { Status } from '../announcement.entity';

export class UpdateAnnouncementStatusDto {
  @IsIn(['active', 'closed'])
  status!: Status;
}
