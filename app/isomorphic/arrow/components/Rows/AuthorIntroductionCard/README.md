# Author Introduction Card

Author Introduction card is used to display the author information which consists of name, bio with author image and social connect of the author.

## Usage

Import the AuthorIntroductionCard and pass authorDetails as props and config.

```jsx
import { AuthorIntroductionCard } from "@quintype/arrow";
```

### Use as a component

```jsx
const contextConfig = {
  theme: #333333;
  enableBio: false;
  enableSocialLinks: true;
};
<AuthorIntroductionCard props={authorDetails} config={contextConfig} >

```

```jsx
const contextConfig = {
  theme: #333333;
  enableBio: false;
  enableSocialLinks: true;
};
<AuthorIntroductionCard props={authorDetails} config={contextConfig} template="square" >

```

```jsx
const contextConfig = {
  theme: #333333;
  enableBio: false;
  enableSocialLinks: true;
};
<AuthorIntroductionCard props={authorDetails} config={contextConfig} template="smallCircle" >

```
