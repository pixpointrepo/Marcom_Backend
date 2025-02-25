const generateUrl = (path) => {
    // return path.toLowerCase().split(" ").join("-");
    return path.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

module.exports = generateUrl;