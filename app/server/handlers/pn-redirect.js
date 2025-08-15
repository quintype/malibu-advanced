import logger from "@quintype/framework/server/logger";

/**
 * Handles push notification redirects
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function handlePNRedirect(req, res, next) {
  try {
    const { url, target, redirect, link, pn, push, notification } = req.query;

    // Check if this is a PN link
    const isPNLink =
      pn ||
      push ||
      notification ||
      req.path.includes("/pn/") ||
      req.path.includes("/push/") ||
      req.path.includes("/notification/");

    if (!isPNLink) {
      return next();
    }

    // Extract target URL from query parameters
    let targetURL = url || target || redirect || link;

    if (!targetURL) {
      // If no target URL provided, redirect to home page
      targetURL = "/";
    } else {
      // Decode the URL if it's encoded
      try {
        targetURL = decodeURIComponent(targetURL);
      } catch (error) {
        logger.warn("Failed to decode target URL:", targetURL);
      }
    }

    // Validate the target URL to prevent open redirects
    if (!isValidRedirectURL(targetURL)) {
      logger.warn("Invalid redirect URL detected:", targetURL);
      targetURL = "/";
    }

    // Add PWA redirect parameters
    const redirectURL = new URL(targetURL, req.protocol + "://" + req.get("host"));
    redirectURL.searchParams.set("pwa_redirect", "true");
    redirectURL.searchParams.set("source", "pn");

    // Log the redirect for analytics
    logger.info("PN Redirect:", {
      from: req.originalUrl,
      to: redirectURL.toString(),
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

    // Perform the redirect
    res.redirect(302, redirectURL.toString());
  } catch (error) {
    logger.error("Error in PN redirect handler:", error);
    // Fallback to home page on error
    res.redirect(302, "/");
  }
}

/**
 * Validates if a URL is safe for redirect
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is safe
 */
function isValidRedirectURL(url) {
  try {
    // Check if it's a relative URL (safe)
    if (url.startsWith("/")) {
      return true;
    }

    // Check if it's a valid URL
    const parsedURL = new URL(url);

    // Only allow same-origin redirects or trusted domains
    const allowedDomains = [
      "localhost",
      "127.0.0.1",
      "malibu-advanced-web.quintype.io",
      "malibu-advanced-web.qtstage.io",
    ];

    return allowedDomains.some((domain) => parsedURL.hostname === domain || parsedURL.hostname.endsWith("." + domain));
  } catch (error) {
    // Invalid URL
    return false;
  }
}

/**
 * Creates a PN redirect URL
 * @param {string} targetURL - The URL to redirect to
 * @param {string} baseURL - Base URL for the PN link
 * @returns {string} - PN redirect URL
 */
export function createPNRedirectURL(targetURL, baseURL = "") {
  const encodedURL = encodeURIComponent(targetURL);
  return `${baseURL}/pn/redirect?url=${encodedURL}`;
}
