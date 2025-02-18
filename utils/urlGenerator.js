const generateUrl = (path) => {
    return path.toLowerCase().split(" ").join("-");
}

module.exports = generateUrl;