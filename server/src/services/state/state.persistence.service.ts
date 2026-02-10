import { z } from "zod";
import { HomeState, HomeStateZod } from "./types.zod";
import { Pool } from "pg";

export const DbHomeStateZod = z.object({
  id: z.string(),
  name: z.string(),
  state: HomeStateZod,
});

export class StatePersistenceService {
  constructor(private readonly pool: Pool) {}

  public async getHomeState(name: string): Promise<HomeState | null> {
    const result = await this.pool.query(
      `
SELECT id, name, state
FROM public.home_state
WHERE name = $1`,
      [name],
    );

    const [matchingHome] = result.rows;
    if (!matchingHome) {
      console.log(`Home ${name} not found.`);
      return null;
    }

    const parsedHome = DbHomeStateZod.parse(matchingHome);

    return parsedHome.state;
  }

  public async storeHomeState(homeState: HomeState): Promise<void> {
    await this.pool.query(
      `
INSERT INTO public.home_state (name, state)
VALUES ($1, $2)
ON CONFLICT (name) DO UPDATE SET state = EXCLUDED.state`,
      [homeState.name, homeState],
    );
  }
}
