import React from 'react';
import {
  Box,
  Flex,
  Link,
  Heading,
  Text,
  Button,
  Container,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FaBrush, FaChartBar, FaShareAlt, FaLightbulb, FaRedo, FaSearch, FaPencilAlt, FaCheck } from 'react-icons/fa';
import arrow from './arrow.png';
import paintImage from "./paint.png";

// Define a royal dark green color
const royalDarkGreen = "#1A365D";
// Define a lighter green color for hover effect
const lighterGreen = "#FCA311";

const ExpandingButton = ({ children, onClick, ...props }) => (
  <Button
    {...props}
    onClick={onClick}
    _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s', bg: lighterGreen }}
    _active={{ transform: 'scale(0.95)' }}
    bg={royalDarkGreen}
    color="white"
  >
    {children}
  </Button>
);

const FeatureCard = ({ icon, title, description }) => (
  <Card
    _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
    height="100%"
    p={6}
  >
    <VStack align="center" spacing={4}>
      <Icon as={icon} boxSize={12} color={royalDarkGreen} />
      <Heading size="md">{title}</Heading>
      <Text textAlign="center" color="gray.600">{description}</Text>
    </VStack>
  </Card>
);

const PricingCard = ({ name, priceFormatted, description, color, onGetNow }) => (
  <Card
    _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
    borderTop="4px solid"
    borderTopColor={color}
    height="100%"
  >
    <CardHeader>
      <Heading size="2xl" mb={2}>{name}</Heading>
      <Text fontSize="lg" fontWeight="bold" color={color}>{priceFormatted}</Text>
    </CardHeader>
    <CardBody>
      <List spacing={3}>
        {description.split('. ').map((point, index) => (
          <ListItem key={index} display="flex" alignItems="center">
            <ListIcon as={FaCheck} color={color} />
            <Text>{point}</Text>
          </ListItem>
        ))}
      </List>
    </CardBody>
    <CardFooter>
      <Button 
        width="full" 
        onClick={onGetNow} 
        bg={royalDarkGreen} 
        color="white"
        _hover={{ bg: lighterGreen }}
      >
        Get Now
      </Button>
    </CardFooter>
  </Card>
);

const LandingPage = ({ handleGoogleLogin }) => {
  const pricingPlans = [
    {
      id: "333152",
      name: "20 Credits",
      price: 1900,
      priceFormatted: "$19.00",
      description: "Perfect for first-time users or occasional projects. Access to new templates daily. Ideal for small businesses and individuals.",
      color: royalDarkGreen
    },
    {
      id: "333153",
      name: "60 Credits",
      price: 3900,
      priceFormatted: "$39.00",
      description: "Great for regular users or small teams. Access to new templates daily. Create professional, customized infographics for your presentations, reports, and social media content.",
      color: royalDarkGreen
    },
    {
      id: "333154",
      name: "120 Credits",
      price: 6900,
      priceFormatted: "$69.00",
      description: "Ideal for power users, marketing teams, and agencies. Access to new templates daily. Generate a wide range of stunning infographics for all your data visualization needs.",
      color: royalDarkGreen
    }
  ];

  const features = [
    {
      icon: FaChartBar,
      title: "Visualize Complex Data",
      description: "Transform intricate information into clear, visually appealing graphics that your audience can easily understand and remember."
    },
    {
      icon: FaPencilAlt,
      title: "Create from Scratch",
      description: "No existing article? No problem. Generate stunning infographics from scratch with our intuitive tools and templates."
    },
    {
      icon: FaShareAlt,
      title: "Boost Social Media Impact",
      description: "Create eye-catching infographics that stand out on social platforms, driving engagement and increasing your content's reach."
    },
    {
      icon: FaLightbulb,
      title: "Highlight Key Insights",
      description: "Emphasize crucial points and statistics from your content, making it easier for readers to grasp and retain important information."
    },
    {
      icon: FaRedo,
      title: "Revitalize Existing Content",
      description: "Give your older blog posts and articles new life by transforming them into fresh, shareable infographics."
    },
    {
      icon: FaSearch,
      title: "Enhance SEO Discoverability",
      description: "Improve your content's SEO performance with keyword-rich, visually appealing infographics that search engines love."
    }
  ];

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Box as="header" py={4} px={8}>
        <Flex justify="space-between" align="center">
          <Link href="#" display="flex" alignItems="center">
          <Image 
              src={paintImage} 
              alt="Instagraphix Logo" 
              boxSize="40px" 
              mr={2}
            />
            <Heading size="lg">Instagraphix</Heading>
          </Link>
          <HStack as="nav" spacing={6}>
            <Link href="#features" color={royalDarkGreen}>Features</Link>
            <Link href="#pricing" color={royalDarkGreen}>Pricing</Link>
          </HStack>
        </Flex>
      </Box>

      <Box as="main" flex={1}>
        <Container maxW="container.xl" py={20}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={12} alignItems="center">
            <VStack align="start" spacing={6} justifyContent="center">
              <Heading size="2xl">Turn Your Text Into Beautiful Infographics</Heading>
              <Text fontSize="xl" color="gray.600">
                Instagraphix is the easiest way to create stunning infographics from your text. No design skills required!
              </Text>
              <ExpandingButton size="lg" onClick={handleGoogleLogin}>
                Get Started
              </ExpandingButton>
            </VStack>
            <Box>
              <Image
                src={arrow}
                alt="Text to Infographic Conversion"
                width="100%"
                height="auto"
                objectFit="contain"
                borderRadius="lg"
              />
            </Box>
          </SimpleGrid>
        </Container>

        <Box py={20}>
          <Container maxW="container.xl">
            <VStack spacing={8} align="center">
              <Heading size="2xl">Watch How It Works</Heading>
              <Text fontSize="xl" color="gray.600" maxW="3xl" textAlign="center">
                See Instagraphix in action and learn how to create stunning infographics in minutes.
              </Text>
              <Box width="100%" maxW="4xl" borderRadius="xl" overflow="hidden">
                <video
                  width="100%"
                  height="auto"
                  controls
                  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                />
              </Box>
            </VStack>
          </Container>
        </Box>

        <Box bg="gray.50" py={20} id="features">
          <Container maxW="container.xl">
            <VStack spacing={16}>
              <VStack spacing={4}>
                <Heading size="2xl">Key Features</Heading>
                <Text fontSize="xl" color="gray.600" maxW="3xl" textAlign="center">
                  Instagraphix offers powerful tools to transform your content into engaging visual stories. Here's what you can do:
                </Text>
              </VStack>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="full">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        <Box bg="gray.50" py={20} id="pricing">
          <Container maxW="container.xl">
            <VStack spacing={16}>
              <VStack spacing={4}>
                <Heading size="2xl">Pricing</Heading>
                <Text fontSize="xl" color="gray.600" maxW="3xl" textAlign="center">
                  Choose the plan that fits your needs and budget.<br></br>
                  Each credit allows one generation cycle.
                </Text>
              </VStack>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="full">
                {pricingPlans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    name={plan.name}
                    priceFormatted={plan.priceFormatted}
                    description={plan.description}
                    color={plan.color}
                    onGetNow={handleGoogleLogin}
                  />
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        <Box bg="gray.50" py={20}>
          <Container centerContent>
            <ExpandingButton size="lg" onClick={handleGoogleLogin}>
              Get Started
            </ExpandingButton>
          </Container>
        </Box>
      </Box>

      <Box as="footer" borderTopWidth={1} py={6} px={8}>
        <Flex direction={{ base: 'column', sm: 'row' }} align="center" justify="space-between">
          <Text fontSize="sm" color="gray.600">
            © 2024 Instagraphix. All rights reserved.
          </Text>
          <HStack spacing={6} mt={{ base: 4, sm: 0 }}>
            <Link href="#" fontSize="sm" color={royalDarkGreen}>Terms of Service</Link>
            <Link href="#" fontSize="sm" color={royalDarkGreen}>Privacy</Link>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default LandingPage;