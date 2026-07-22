import { library } from "@theholocron/tsdown-config/presets/library";

export default library({
	deps: { neverBundle: [/^@theholocron\//, /^dotenv/] },
});
