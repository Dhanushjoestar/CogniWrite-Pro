export const platforms = [
  { value: 'blog', label: 'Blog' },
  { value: 'twitter/x', label: 'twitter/x' },
  { value: 'Email', label: 'Email' },
  { value: 'LinkedIn', label: 'LinkedIn' },
];

export const audiences = [
  { value: 'tech_enthusiasts', label: 'Tech Enthusiasts' },
  { value: 'small_business_owners', label: 'Small Business Owners' },
  { value: 'marketing_professionals', label: 'Marketing Professionals' },
  { value: 'general_public', label: 'General Public' },
];

export const models = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'mistral', label: 'mistral' }
];

export const tabConfig = {
  generate: {
    title: 'Content Generation',
    description: 'Create engaging content with AI assistance'
  },
  'ab-test': {
    title: 'A/B Testing',
    description: 'Test and optimize your content performance'
  },
  review: {
    title: 'Content Review',
    description: 'Review and improve your content quality'
  }
  
};
export const temperatures = [
  { value: 0.2, label: '0.2 (More Conservative)' },
  { value: 0.5, label: '0.5 (Balanced)' },
  { value: 0.7, label: '0.7 (Default)' },
  { value: 1.0, label: '1.0 (More Creative)' },
  { value: 1.2, label: '1.2 (Highly Creative)' },
];