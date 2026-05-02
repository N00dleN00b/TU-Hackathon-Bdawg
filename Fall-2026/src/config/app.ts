type AppConfigType = {
    name: string,
    github: {
        title: string,
        url: string
    },
    author: {
        name: string,
        url: string
    },
}

export const appConfig: AppConfigType = {
    name: import.meta.env.VITE_APP_NAME ?? "TruthLens",
    github: {
        title: "TruthLens — TU Hackathon Fall 2026",
        url: "https://github.com/",
    },
    author: {
        name: "TU Hackathon Team",
        url: "#",
    }
}

export const baseUrl = import.meta.env.VITE_BASE_URL ?? ""
