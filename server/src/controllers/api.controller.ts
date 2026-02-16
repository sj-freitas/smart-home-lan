import { Controller, Get, HttpCode } from "@nestjs/common";

@Controller("/api")
export class ApiController {
  @Get("/health")
  @HttpCode(200)
  public healthCheck() {
    return { healthy: true };
  }
}
