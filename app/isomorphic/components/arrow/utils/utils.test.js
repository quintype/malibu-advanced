import { updateContentLinks, isEmpty, sharePageUrl, getAuthorTwitterUrl } from "./utils";

describe("updateContentLinks", () => {
  it("should add target='_blank' to anchor tags if target attribute not present", () => {
    const content =
      "<p>Coronavirus in India News Live Updates: <a target='_parent'>India</a> has recorded the <a href='#'>highest</a> single-day spike in fresh cases of novel <a>coronavirus</a> with the number crossing 1,300.";
    const updatedContent = updateContentLinks(content);
    expect(updatedContent).toBe(
      "<p>Coronavirus in India News Live Updates: <a target='_parent'>India</a> has recorded the <a aria-label='content' target='_blank' href='#'>highest</a> single-day spike in fresh cases of novel <a aria-label='content' target='_blank'>coronavirus</a> with the number crossing 1,300."
    );
  });
});

describe("getAuthorTwitterUrl", () => {
  const author = {
    id: 123981,
    name: "Ravigopal Kesari",
    slug: "ravigopal-kesari"
  };
  const socialData = {
    social: {
      twitter: {
        url: "https://www.twitter.com/sabqorg",
        handle: "elonmusk"
      }
    }
  };
  it("should return empty string when the author object doesn't have 'social' key ", () => {
    const authorTwitterLink = getAuthorTwitterUrl(author);
    expect(authorTwitterLink).toBe("");
  });

  it("should return twitter url when both url and handle are present  ", () => {
    const modifiedAuthor = Object.assign({}, author, socialData);
    const authorTwitterLink = getAuthorTwitterUrl(modifiedAuthor);
    expect(authorTwitterLink).toBe("https://www.twitter.com/sabqorg");
  });

  it("should return twitter handle link when url is not present  ", () => {
    const socialData = {
      social: {
        twitter: {
          handle: "elonmusk"
        }
      }
    };

    const modifiedAuthor = Object.assign({}, author, socialData);
    const authorTwitterLink = getAuthorTwitterUrl(modifiedAuthor);
    expect(authorTwitterLink).toBe("https://www.twitter.com/elonmusk");
  });

  it("should strip @ in  twitter handle  and construct link", () => {
    const socialData = {
      social: {
        twitter: {
          handle: "@elonmusk"
        }
      }
    };
    const modifiedAuthor = Object.assign({}, author, socialData);
    const authorTwitterLink = getAuthorTwitterUrl(modifiedAuthor);
    expect(authorTwitterLink).toBe("https://www.twitter.com/elonmusk");
  });
});

describe("isEmpty", () => {
  it("should return true if the value is null/ undefined", () => {
    const value = null;
    const result = isEmpty(value);
    expect(result).toBe(true);
  });

  it("should return true if the value is an empty string", () => {
    const value = "";
    const result = isEmpty(value);
    expect(result).toBe(true);
  });

  it("should return true if the value is an empty object", () => {
    const value = {};
    const result = isEmpty(value);
    expect(result).toBe(true);
  });

  it("should return false if the value is not null/ undefined", () => {
    const value = 6;
    const result = isEmpty(value);
    expect(result).toBe(false);
  });

  it("should return false if the value is not an empty string", () => {
    const value = "value";
    const result = isEmpty(value);
    expect(result).toBe(false);
  });

  it("should return false if the value is not an empty object", () => {
    const value = { data: "read" };
    const result = isEmpty(value);
    expect(result).toBe(false);
  });

  it("should return window if the page url is defined", () => {
    const result = sharePageUrl;
    expect(result).toBe(window.location.href);
  });
});
