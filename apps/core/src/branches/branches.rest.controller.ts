import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Patch,
  DefaultValuePipe,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './request-dto/createBranch.dto';
import { UpdateBranchDto } from './request-dto/updateBranch.dto';
import { GetMetaParams, RoleEnum, UserMetadataParams } from '@erp-modul/shared';

@Controller('branches')
export class BranchesRestController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Get()
  async findAll(@Query('skip') skip = 0) {
    const take = 20;
    const list = await this.branchesService.findAll(skip, take);

    return {
      skip,
      take,
      list,
    };
  }

  @Get('search')
  async search(
    @GetMetaParams() meta: UserMetadataParams,
    @Query('term', new DefaultValuePipe(null)) term: string,
  ) {
    const take = 20;
    const skip = 0;
    const branches = await this.branchesService.search({
      take,
      skip,
      term,
      branchId: ![
        RoleEnum.Admin,
        RoleEnum.ComplianceManager,
        RoleEnum.HeadOfBranch,
      ].includes(meta.role)
        ? meta.branchId
        : undefined,
    });

    return { branches };
  }

  @Get(':id')
  findOne(@GetMetaParams() meta: UserMetadataParams, @Param('id') id: number) {
    return this.branchesService.findOne(meta, id);
  }

  @Patch(':id')
  update(
    @GetMetaParams() meta: UserMetadataParams,
    @Param('id') id: number,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return this.branchesService.update(meta, id, updateBranchDto);
  }
}
