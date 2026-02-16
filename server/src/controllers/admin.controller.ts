import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { ApiKeyGuard } from "../services/api-key.guard";
import { z } from "zod";
import { EmailsPersistenceService } from "../services/auth/emails.persistence.service";

const AddAccessToEmailBodyRequestZod = z
  .object({
    emailAddress: z.string(),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
  })
  .transform((t) => ({
    emailAddress: t.emailAddress,
    startDate: new Date(t.startDate),
    endDate: new Date(t.endDate),
  }));

/**
 * Current authentication via API Key only. But ideally should use a role validation instead.
 * We don't support roles yet. The API key flow is incredibly limited only for special use
 * cases.
 */
@Controller("api/admin")
@UseGuards(ApiKeyGuard)
export class AdminController {
  constructor(
    private readonly emailsPersistenceService: EmailsPersistenceService,
  ) {}

  @Post("/access")
  public async addAccessToEmail(@Req() request: Request) {
    const parsedBody = AddAccessToEmailBodyRequestZod.safeParse(request.body);

    if (parsedBody.error) {
      throw new BadRequestException();
    }

    const { emailAddress, startDate, endDate } = parsedBody.data;

    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException(`endDate cannot be prior to startDate.`);
    }

    return await this.emailsPersistenceService.addEmail(
      emailAddress,
      startDate,
      endDate,
    );
  }
}
