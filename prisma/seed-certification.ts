import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCertification() {
  console.log('🎓 Seeding certification data...')

  // Create educational content
  const contents = [
    {
      title: 'Introduction to Loyalty Programs',
      description: 'Understanding the fundamentals of customer loyalty programs',
      content: `A loyalty program is a marketing strategy designed to encourage customers to continue to shop at or use the services of a business associated with the program. These programs exist covering most types of commerce, each one having varying features and rewards-schemes.

Key benefits of loyalty programs:
- Increased customer retention
- Higher customer lifetime value
- Better customer insights and data
- Competitive advantage
- Word-of-mouth marketing`,
      type: 'TEXT',
      order: 1,
      isPublished: true,
    },
    {
      title: 'Omniwallet Platform Overview',
      description: 'Learn about the Omniwallet loyalty platform features',
      content: `Omniwallet is a comprehensive loyalty management platform that helps businesses create, manage, and optimize their customer loyalty programs.

Core Features:
- Multi-tier reward systems
- Points and cashback management
- Customer segmentation
- Analytics and reporting
- API integration
- Mobile app support

The platform is designed to scale from small businesses to enterprise-level implementations.`,
      type: 'TEXT',
      order: 2,
      isPublished: true,
    },
    {
      title: 'Partner Integration Best Practices',
      description: 'How to successfully integrate and promote Omniwallet',
      content: `As an Omniwallet partner, following these best practices will help you succeed:

1. **Understand Your Client's Needs**
   - Assess their current customer retention challenges
   - Identify their target audience
   - Determine the right program structure

2. **Effective Implementation**
   - Plan the integration timeline
   - Ensure proper API setup
   - Train client staff on the platform

3. **Ongoing Support**
   - Monitor program performance
   - Provide regular insights and recommendations
   - Stay updated on new Omniwallet features

4. **Communication**
   - Regular check-ins with clients
   - Proactive problem solving
   - Share success stories and case studies`,
      type: 'TEXT',
      order: 3,
      isPublished: true,
    },
    {
      title: 'Understanding Commission Structures',
      description: 'Learn how partner commissions work with Omniwallet',
      content: `Omniwallet offers flexible commission structures for partners:

**Agency Partners**: Earn 15-25% commission on monthly subscription fees
**Tech Partners**: Receive integration fees and ongoing revenue share
**Referral Partners**: Get one-time referral bonuses

Commission Calculation:
- Based on active client accounts
- Paid monthly via invoice
- Tracked in partner dashboard
- Bonuses for high-performing partners

Partners who refer clients that stay active for 12+ months may qualify for performance bonuses.`,
      type: 'TEXT',
      order: 4,
      isPublished: true,
    },
    {
      title: 'Customer Success Strategies',
      description: 'Helping your clients succeed with their loyalty programs',
      content: `Ensuring client success is key to long-term partnerships:

**Onboarding Phase (Month 1-2)**
- Complete platform setup
- Define program rules and rewards
- Train client team
- Launch communication campaign

**Growth Phase (Month 3-6)**
- Monitor enrollment metrics
- Optimize reward structures
- A/B test messaging
- Analyze customer behavior

**Optimization Phase (Month 6+)**
- Review program ROI
- Implement advanced features
- Scale successful strategies
- Explore new integration opportunities

Regular communication and data-driven decisions are essential for sustainable growth.`,
      type: 'TEXT',
      order: 5,
      isPublished: true,
    },
  ]

  for (const content of contents) {
    await prisma.certificationContent.create({ data: content })
    console.log(`  ✓ Created content: ${content.title}`)
  }

  // Create exam questions
  const questions = [
    {
      question: 'What is the primary goal of a customer loyalty program?',
      options: JSON.stringify([
        'To increase one-time purchases',
        'To encourage repeat business and customer retention',
        'To reduce marketing costs only',
        'To collect customer data exclusively',
      ]),
      correctAnswer: 1,
      explanation: 'The primary goal of loyalty programs is to encourage customers to continue doing business with the company, thereby increasing customer retention and lifetime value.',
      order: 1,
      isActive: true,
    },
    {
      question: 'Which of the following is NOT a core feature of the Omniwallet platform?',
      options: JSON.stringify([
        'Multi-tier reward systems',
        'Analytics and reporting',
        'Physical gift card printing',
        'API integration',
      ]),
      correctAnswer: 2,
      explanation: 'Omniwallet is a digital platform focused on digital loyalty management. Physical gift card printing is not a core feature.',
      order: 2,
      isActive: true,
    },
    {
      question: 'What commission rate do Agency Partners typically earn?',
      options: JSON.stringify([
        '5-10% commission',
        '15-25% commission',
        '30-40% commission',
        'Fixed monthly fee only',
      ]),
      correctAnswer: 1,
      explanation: 'Agency Partners earn 15-25% commission on monthly subscription fees from their referred clients.',
      order: 3,
      isActive: true,
    },
    {
      question: 'During the onboarding phase, which activity is MOST critical?',
      options: JSON.stringify([
        'A/B testing messaging',
        'Complete platform setup and team training',
        'Implementing advanced features',
        'Reviewing program ROI',
      ]),
      correctAnswer: 1,
      explanation: 'During onboarding (Month 1-2), complete platform setup and training the client team are the most critical activities to ensure a successful launch.',
      order: 4,
      isActive: true,
    },
    {
      question: 'How many leads must a Loyalty Partner create per year to meet certification requirements?',
      options: JSON.stringify([
        '5 leads',
        '10 leads',
        '15 leads',
        '20 leads',
      ]),
      correctAnswer: 1,
      explanation: 'Certified Loyalty Partners must create at least 10 leads per year as part of the partnership requirements.',
      order: 5,
      isActive: true,
    },
    {
      question: 'What is a key benefit of customer segmentation in loyalty programs?',
      options: JSON.stringify([
        'It reduces program costs',
        'It allows for personalized rewards and communications',
        'It eliminates the need for analytics',
        'It simplifies the reward structure',
      ]),
      correctAnswer: 1,
      explanation: 'Customer segmentation allows businesses to provide personalized rewards and targeted communications, increasing program effectiveness.',
      order: 6,
      isActive: true,
    },
    {
      question: 'When should partners start monitoring enrollment metrics?',
      options: JSON.stringify([
        'Onboarding Phase (Month 1-2)',
        'Growth Phase (Month 3-6)',
        'Optimization Phase (Month 6+)',
        'Only after the first year',
      ]),
      correctAnswer: 1,
      explanation: 'Partners should start monitoring enrollment metrics during the Growth Phase (Month 3-6) to track program adoption and success.',
      order: 7,
      isActive: true,
    },
    {
      question: 'What type of data does Omniwallet help partners and clients collect?',
      options: JSON.stringify([
        'Only transaction data',
        'Customer behavior, preferences, and engagement data',
        'Only demographic information',
        'No data collection capabilities',
      ]),
      correctAnswer: 1,
      explanation: 'Omniwallet provides comprehensive analytics including customer behavior, preferences, and engagement data to help optimize loyalty programs.',
      order: 8,
      isActive: true,
    },
    {
      question: 'Which partner type receives integration fees?',
      options: JSON.stringify([
        'Referral Partners',
        'Agency Partners',
        'Tech Partners',
        'All partner types',
      ]),
      correctAnswer: 2,
      explanation: 'Tech Partners receive integration fees and ongoing revenue share for technical implementations.',
      order: 9,
      isActive: true,
    },
    {
      question: 'What is the minimum passing score for the Loyalty Partner certification exam?',
      options: JSON.stringify([
        '60%',
        '65%',
        '70%',
        '80%',
      ]),
      correctAnswer: 2,
      explanation: 'Partners must achieve a minimum score of 70% to pass the certification exam and earn the Certified Loyalty Partner badge.',
      order: 10,
      isActive: true,
    },
    {
      question: 'How often are partner commissions paid?',
      options: JSON.stringify([
        'Weekly',
        'Monthly via invoice',
        'Quarterly',
        'Annually',
      ]),
      correctAnswer: 1,
      explanation: 'Partner commissions are calculated and paid monthly via invoice, tracked in the partner dashboard.',
      order: 11,
      isActive: true,
    },
    {
      question: 'What should be done during the Optimization Phase of client management?',
      options: JSON.stringify([
        'Complete initial platform setup',
        'Launch communication campaign',
        'Review program ROI and implement advanced features',
        'Define program rules',
      ]),
      correctAnswer: 2,
      explanation: 'During the Optimization Phase (Month 6+), partners should review program ROI, implement advanced features, and scale successful strategies.',
      order: 12,
      isActive: true,
    },
  ]

  for (const question of questions) {
    await prisma.certificationQuestion.create({ data: question })
    console.log(`  ✓ Created question: ${question.question.substring(0, 50)}...`)
  }

  console.log('\n✅ Certification data seeded successfully!')
  console.log(`   - ${contents.length} educational content items`)
  console.log(`   - ${questions.length} exam questions`)
}

seedCertification()
  .catch((e) => {
    console.error('Error seeding certification data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
