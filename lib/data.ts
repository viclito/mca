export interface Content {
  id: string;
  title: string;
  type: 'note' | 'video' | 'pdf';
  url: string; // URL to video or PDF/Image content
  pages?: string[]; // For book flip notes (array of image URLs or text)
  description?: string;
  unit?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  contents: Content[];
}

export interface Semester {
  id: string; // e.g., 'sem-1'
  name: string; // 'Semester 1'
  subjects: Subject[];
}

export interface Course {
  id: string; // 'mca'
  title: string;
  description: string;
  semesters: Semester[];
}

// Mock Data
export const USERS_COURSE: Course = {
  id: 'mca',
  title: 'Master of Computer Applications (MCA)',
  description: 'A comprehensive post-graduate degree in computer applications.',
  semesters: [
    {
      id: 'sem-1',
      name: 'Semester 1',
      subjects: [
        {
          id: 'math',
          name: 'Discrete Mathematics',
          code: 'MCA101',
          description: 'Study of mathematical structures that are fundamentally discrete rather than continuous.',
          contents: [
            {
              id: 'note-1',
              title: 'Set Theory Basics',
              type: 'note',
              url: '',
              description: 'Introduction to sets, relations, and functions.',
              unit: 1,
              pages: [
                'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=1000&auto=format&fit=crop', // Placeholder paper texture/content
                'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?q=80&w=1000&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1000&auto=format&fit=crop',
              ]
            },
            {
              id: 'vid-1',
              title: 'Graph Theory Introduction',
              type: 'video',
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
              description: 'Understanding graphs and trees.',
              unit: 2
            }
          ]
        },
        {
            id: 'fa',
            name: 'Financial Accounting',
            code: 'MCA102',
            description: 'Introduction to accounting principles.',
            contents: [],
        },
        {
            id: 'c-lang',
            name: 'C Programming',
            code: 'MCA103',
            description: 'Fundamentals of programming in C.',
            contents: [],
        }
      ]
    },
    {
      id: 'sem-2',
      name: 'Semester 2',
      subjects: [
        {
          id: 'java',
          name: 'Core Java',
          code: 'MCA201',
          description: 'Object-oriented programming using Java.',
          contents: []
        }
      ]
    },
    {
      id: 'sem-3',
      name: 'Semester 3',
      subjects: [
         {
          id: 'web',
          name: 'Web Technologies',
          code: 'MCA301',
          description: 'HTML5, CSS3, JS, and backend integration.',
          contents: []
        }
      ]
    },
    {
      id: 'sem-4',
      name: 'Semester 4',
      subjects: [
         {
          id: 'project',
          name: 'Major Project',
          code: 'MCA401',
          description: 'Final semester industrial project.',
          contents: []
        }
      ]
    }
  ]
};
