import yaml from "js-yaml";

export async function loadConfig() {
  try {
    const response = await fetch(`/config/site.yaml?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    const yamlText = await response.text();
    const config = yaml.load(yamlText);
    return config;
  } catch (error) {
    console.error("Error loading config:", error);
    return getDefaultConfig();
  }
}

function getDefaultConfig() {
  return {
    site: {
      title: "导航门户",
    },
    widgets: [
      { name: "time", gridWidth: "half" },
      { name: "weather", gridWidth: "half" },
      { name: "github-trending" },
      { name: "seasonal-anime" },
    ],
    bookmarks: [],
  };
}
