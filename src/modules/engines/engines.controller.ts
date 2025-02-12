import { Controller } from '@nestjs/common';
import { EnginesService } from './engines.service';

@Controller('engines')
export class EnginesController {
  constructor(private readonly enginesService: EnginesService) {}
}
