# Authors List

Authors List is used to display the authors information which consists of name, bio with author image and social connect of the author.

## Usage

Import the AuthorsList and pass authorDetails as data and config.

```jsx
import { AuthorsList } from "@quintype/arrow";
```

### Use as a component

```jsx
const config = {
  enableBio: boolean("Enable Bio", true),
  buttonText: text("Footer text", "Load More"),
  theme: color("color", "#ffffff")
  enableSocialLinks: boolean("Enable Social Links", true)
};
limit = 9;
<AuthorsList config={config} data={data} getMoreData={getMoreData} limit={limit} hideLoadmore={false} />;
```
