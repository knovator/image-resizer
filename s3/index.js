const { resizer } = require('./resizer');

exports.handler = async (event, context, callback) => {
    try {
        let prefixBaseUrl = process.env.PRIFIX_BASE_URL;
        if (!prefixBaseUrl.endsWith('/')) prefixBaseUrl += '/';
        let s3ImageUrl = event.path;
        let responseUrl = await resizer(s3ImageUrl);

        if (responseUrl) {
            responseUrl = prefixBaseUrl + responseUrl;
            let redirectResponse = {
                statusCode: 302,
                headers: {
                    Location: responseUrl,
                },
            };
            return callback(null, redirectResponse);
        }

        callback(new Error('Image not found'));
    } catch (e) {
        callback(e.message);
    }
};
