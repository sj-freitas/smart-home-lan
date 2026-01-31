import { Controller, Get, Param, Res, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { join } from "path";
import { existsSync } from "fs";

@Controller("/static")
export class StaticController {
  @Get("/files/:name")
  async file(@Param("name") name: string, @Res() res: Response) {
    const filePath = join(
      process.cwd(),
      "static",
      "files",
      name,
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException("File not found");
    }

    return res.sendFile(filePath);
  }
}
