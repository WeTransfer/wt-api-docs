# Errors

The WeTransfer API uses the following conventional error codes:


Code | Meaning
---- | -------
`400` | Bad Request -- Your request is invalid.
`403` | Forbidden -- Your API key is wrong.
`404` | Not Found -- The specified resource could not be found.
`405` | Method Not Allowed -- You tried to access a transfer with an invalid method.
`406` | Not Acceptable -- You requested a format that isn't json.
`410` | Gone -- The transfer requested has been removed from our servers.
`418` | I'm a teapot.
`429` | Too Many Requests -- You're requesting too many things! Slow down!
`500` | Internal Server Error -- We had a problem with our server. Try again later.
`503` | Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
