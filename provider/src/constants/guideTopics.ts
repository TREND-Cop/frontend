/**
 * Video Guide Topics for Trend Business wizard step 1.
 *
 * TODO (Backend): Guide topics and real video streaming endpoints come from the backend.
 */

// Dev-only bundled sample video reference
export const DEV_SAMPLE_GUIDE_VIDEO = require('../../assets/videos/generate_a_sec_video_on_beau.mp4');

export interface GuideTopicData {
  id: string;
  title: string;
  caption: string;
  videoSource: any | null;
}

export const GUIDE_TOPICS: Record<string, GuideTopicData> = {
  'service-category': {
    id: 'service-category',
    title: 'Service Category',
    caption: 'What is service category', // TODO (Copy)
    videoSource: DEV_SAMPLE_GUIDE_VIDEO,
  },
  'service-name': {
    id: 'service-name',
    title: 'Service Name',
    caption: 'What is service name', // TODO (Copy)
    videoSource: DEV_SAMPLE_GUIDE_VIDEO,
  },
  'service-description': {
    id: 'service-description',
    title: 'Service Description',
    caption: 'What is service description', // Exact caption from Figma design frame
    videoSource: DEV_SAMPLE_GUIDE_VIDEO,
  },
  'discounts': {
    id: 'discounts',
    title: 'Discounts',
    caption: 'What is discounts', // TODO (Copy)
    videoSource: DEV_SAMPLE_GUIDE_VIDEO,
  },
  'general': {
    id: 'general',
    title: 'Business Services',
    caption: 'What is business services', // TODO (Copy) - General guide opened from header "?"
    videoSource: DEV_SAMPLE_GUIDE_VIDEO,
  },
  'package-contents': {
    id: 'package-contents',
    title: 'Package Contents',
    caption: 'What is package contents', // TODO (Copy)
    videoSource: DEV_SAMPLE_GUIDE_VIDEO,
  },
};

/**
 * Stub function to retrieve topic guide details.
 *
 * TODO (Backend): Connect to backend CMS/video delivery API.
 */
export function getGuide(topicId: string): GuideTopicData {
  if (GUIDE_TOPICS[topicId]) {
    return GUIDE_TOPICS[topicId];
  }
  // Fallback for unknown or dynamic topics
  return {
    id: topicId,
    title: topicId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    caption: `What is ${topicId.replace(/-/g, ' ').toLowerCase()}`,
    videoSource: DEV_SAMPLE_GUIDE_VIDEO,
  };
}
