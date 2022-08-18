# StoryCard with background image

The _StoryCard_ component with background image used to represent a story within a Row.

The _StoryCard_ can be composible based on it's children(Atoms, molecule).

### Story Card with background image

```jsx
<StoryCard story={story} useImageAsBackground>
  <HeroImage story={story} />
  <StorycardContent story={story} />
</StoryCard>
```

### Story Card with background image and overlap with content

```jsx
<StoryCard story={story} bgImgContentOverlap>
  <HeroImage story={story} />
  <StorycardContent story={story} />
</StoryCard>
```

<!-- PROPS -->
