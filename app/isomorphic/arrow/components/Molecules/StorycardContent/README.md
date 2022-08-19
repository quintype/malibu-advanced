# StoryCard Content

The _StoryCardContent_ component is a basic [molecule] used to represent a storyCard content within a Row.

The _StoryCardContent_ can be composible based on it's children(Atoms).

## Usage

### Default Story Card

```jsx
<StoryCardContent story={story} />
```

### Story Card with Headline and Timestamp

```jsx
<StorycardContent story={story}>
  <Headline story={story} />
  <AuthorWithTime story={story} />
</StorycardContent>
```

### Story Card with Headline, Author with Timestamp and Subheadline

```jsx
<StorycardContent story={story}>
  <Headline story={story} />
  <Subheadline story={story} />
  <AuthorWithTime story={story} />
</StorycardContent>
```

<!-- PROPS -->
