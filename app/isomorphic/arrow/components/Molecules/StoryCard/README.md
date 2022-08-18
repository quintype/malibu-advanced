# StoryCard

The _StoryCard_ component is a basic [molecule](https://bradfrost.com/blog/post/atomic-web-design/#molecules) used to represent a story within a Row.

The _StoryCard_ can be composible based on it's children(Atoms) or using StoryCardContent component(molecule).

## Usage

### Default Story Card

```jsx
<StoryCard story={story} />
```

### Horizontal Story Card

```jsx
<StoryCard story={story} isHorizontal />
```

### Story Card w/ Image & Headline

```jsx
<StoryCard story={story}>
  <HeroImage story={story} />
  <Headline story={story} />
</StoryCard>
```

### Story Card w/ Image & Timestamp

```jsx
<StoryCard story={story}>
  <Headline story={story} />
  <TimeStamp story={story} />
</StoryCard>
```

### Story Card w/ Headline, Author & Subheadline

```jsx
<StoryCard story={story}>
  <Headline story={story} />
  <Author story={story} />
  <Subheadline story={story} />
</StoryCard>
```

### Story Card w/ Image, Headline, Author+Timestamp & Subheadline

```jsx
<StoryCard story={story}>
  <HeroImage story={story} />
  <Headline story={story} />
  <AuthorWithTime story={story} />
  <Subheadline story={story} />
</StoryCard>
```

### Story Card using Story content

```jsx
<StoryCard story={story}>
  <HeroImage story={story} />
  <StorycardContent story={story} />
</StoryCard>
```

### Story Card using aspect ratio

```jsx
<StoryCard story={story} aspectRatio={[4, 3]} />
```

<!-- PROPS -->
