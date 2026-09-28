// =========================================
// SIKKER — Collection System
// =========================================

const COLLECTION_DATA_URL = "/data/collections/collections.json";

async function loadCollections() {

    try {

        const response =
            await fetch(COLLECTION_DATA_URL);

        if (!response.ok) {
            throw new Error("Could not load collection data.");
        }

        const data = await response.json();

        return data.collections || [];

    } catch (error) {

        console.error(
            "SIKKER Collection System Error:",
            error
        );

        return [];
    }
}


function getCollectionById(collections, collectionId) {

    return collections.find(
        collection => collection.id === collectionId
    );

}


window.SIKKERCollections = {

    loadCollections,

    getCollectionById

};