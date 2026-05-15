import {
  installedLocalModelChoices,
  recommendedLocalModelChoices,
  type ModelChoice
} from "../index.js";
import { additionalLocalModelChoicesForTranslation } from "./supported-local-models.js";

export interface LocalModelChoiceGroup {
  id: "installed" | "recommended" | "more";
  choices: ModelChoice[];
}

export interface LocalModelCatalog {
  choices: ModelChoice[];
  groups: LocalModelChoiceGroup[];
}

export function localModelCatalog(): LocalModelCatalog {
  const installedChoices = installedLocalModelChoices();
  const installedValues = new Set(installedChoices.map((choice) => choice.value));
  const recommendedChoices = recommendedLocalModelChoices.filter((choice) => !installedValues.has(choice.value));
  const moreChoices = additionalLocalModelChoicesForTranslation.filter((choice) => !installedValues.has(choice.value));

  return {
    choices: [...installedChoices, ...recommendedChoices, ...moreChoices],
    groups: visibleGroups([
      { id: "installed", choices: installedChoices },
      { id: "recommended", choices: recommendedChoices },
      { id: "more", choices: moreChoices }
    ])
  };
}

function visibleGroups(groups: LocalModelChoiceGroup[]): LocalModelChoiceGroup[] {
  return groups.filter((group) => group.choices.length > 0);
}
