# Author Card

Displays the author details as a card for the story page

### Use as a component

#### default template

```jsx
<AuthorCard story={story} />
```

#### Author card with right align template

```jsx
<AuthorCard story={story} template="rightAligned" />
```

#### Author card with center align template

```jsx
<AuthorCard story={story} template="centerAligned" />
```

#### Author card with default align template

```jsx
<AuthorCard story={story} template="default" />
```

#### Author card with left align template

```jsx
<AuthorCard story={story} template="leftAligned" />
```

#### Author card with options

```jsx
<AuthorCard
story={story}
template="default"
opts={
  hideImage: true,
  hideBio: true,
  showLabels: false,
  showGuestAuthorName: false,
  showGuestAuthorImage: false,
  localizedAuthorLabel: "Author",
  localizedGuestAuthorLabel: "Guest Author"
}
/>
```

<!-- PROPS -->
