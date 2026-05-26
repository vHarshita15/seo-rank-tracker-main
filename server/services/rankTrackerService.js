export async function rankTracker(keyword, targetDomain) {
    return {
        success: true,
        data: {
            keyword,
            targetDomain,
            position: null,
            page: null,
            title: "",
            snippet: "",
            competitors: [],
            totalResultsScanned: 0
        }
    };
}
