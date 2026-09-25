export const MOCK_NOTIFICATIONS = [
  {
    title: 'Today',
    data: [
      {
        id: 'n1',
        title: 'D.R.E Cosmetic',
        time: '12:10pm, 02-03-2026',
        content: 'Lorem ipsum dolor sit amet consectetur. Egestas sit at fermentum at ante integer. Ac nulla aliquam rutrum viverra.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
        isUnread: true,
        initials: 'SM',
      },
      {
        id: 'n5',
        title: 'Barber Shop Express',
        time: '10:00am, 02-03-2026',
        content: 'Your appointment is confirmed for tomorrow at 2:00 PM. We look forward to seeing you!\n\nPlease arrive 5 minutes early to ensure you get your full service time. If you need to reschedule, please let us know at least 24 hours in advance.',
        isUnread: true,
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&q=80',
      },
      {
        id: 'n6',
        title: 'System Alert',
        time: '08:30am, 02-03-2026',
        content: 'We have updated our terms of service and privacy policy. Please review the changes when you have a moment.\n\nThese changes help us better serve you and protect your personal data in accordance with the latest regulations.',
        isUnread: false,
        initials: 'SA',
      }
    ]
  },
  {
    title: 'Yesterday',
    data: [
      {
        id: 'n2',
        title: 'Fresh Glow',
        time: '12:10pm, 02-03-2026',
        content: 'Don\'t miss out on our weekend special! Get 20% off all facial treatments when you book before Friday.\n\nOur new organic skincare line is also available for purchase in-store. Treat yourself to a glowing weekend!',
        isUnread: false,
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=100&q=80',
      },
      {
        id: 'n3',
        title: 'Aesthetic 101',
        time: '12:10pm, 02-03-2026',
        content: 'Lorem ipsum dolor sit amet consectetur. Egestas sit at fermentum at ante integer. Ac nulla aliquam rutrum viverra.',
        isUnread: false,
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=100&q=80',
      },
      {
        id: 'n4',
        title: 'Plus Care Hospital',
        time: '12:10pm, 02-03-2026',
        content: 'Lorem ipsum dolor sit amet consectetur. Mi sapien sed sit id vitae nullam eu in morbi. Lorem neque ut euismod rhoncus platea donec sit malesuada eget. Vel quam a cursus fames donec semper ut malesuada.\n\nNunc ut vel parturient vitae eget sed elit lorem elementum. Lacus fermentum sed et odio posuere mi magna vivamus. At varius imperdiet nunc diam volutpat. Nulla nisi non sed nulla. Mi neque sed sed nam convallis ut. Sem risus facilisis enim eget lobortis dui.',
        isUnread: false,
        image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=100&q=80',
      },
      {
        id: 'n7',
        title: 'Hair Style Pro',
        time: '09:15am, 01-03-2026',
        content: 'Your favorite barber just opened up a new slot this weekend! Tap here to book your session before it\'s gone.\n\nSlots are filling up fast for the upcoming holiday season. Secure your spot now!',
        isUnread: false,
        initials: 'HS',
      }
    ]
  }
];

export const getNotificationById = (id: string) => {
  for (const section of MOCK_NOTIFICATIONS) {
    const notification = section.data.find(item => item.id === id);
    if (notification) return notification;
  }
  return null;
};
