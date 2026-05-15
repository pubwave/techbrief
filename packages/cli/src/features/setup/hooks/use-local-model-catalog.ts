import { useCallback, useState } from "react";
import { localModelCatalog, type LocalModelCatalog } from "../../local-model/catalog/local-model-catalog.js";

export function useLocalModelCatalog(): {
  catalog: LocalModelCatalog;
  refreshLocalModelCatalog: () => void;
} {
  const [catalog, setCatalog] = useState<LocalModelCatalog>(() => localModelCatalog());
  const refreshLocalModelCatalog = useCallback(() => {
    setCatalog(localModelCatalog());
  }, []);

  return {
    catalog,
    refreshLocalModelCatalog
  };
}
