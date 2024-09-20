import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Center,
  useToast,
  Image,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tag,
  TagLabel,
  TagCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  Flex,
  IconButton,
  Divider,
  Tooltip
} from '@chakra-ui/react';

import { InfoIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { HamburgerIcon, HomeIcon, HistoryIcon, SettingsIcon, QuestionIcon, AddIcon } from '@chakra-ui/icons';
import PricingModal from './PricingModal';
import LandingPage from './LandingPage';


const API_URL = "https://be-194431053746.us-central1.run.app";
// Use API_URL for all your fetch or axios calls

// const EditMode = ({ initialSettings, onUpdate }) => {
//   const [fontSettings, setFontSettings] = useState(initialSettings);

//   const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Verdana'];

//   const handleFontChange = (type, property, value) => {
//     const newSettings = {
//       ...fontSettings,
//       [type]: { ...fontSettings[type], [property]: value }
//     };
//     setFontSettings(newSettings);
//     onUpdate(newSettings);
//   };

//   return (
//     <VStack spacing={6} align="stretch">
//       {['title', 'subtitle', 'body'].map(type => (
//         <Box key={type}>
//           <Text fontWeight="semibold" fontSize="lg" mb={2} textTransform="capitalize">{type} Font</Text>
//           <Select
//             value={fontSettings[type].family}
//             onChange={(e) => handleFontChange(type, 'family', e.target.value)}
//             mb={2}
//           >
//             {fontFamilies.map(font => (
//               <option key={font} value={font}>{font}</option>
//             ))}
//           </Select>
//           <Text fontSize="sm" color="gray.500" mb={1}>Font Size: {fontSettings[type].size}px</Text>
//           <Slider
//             min={8}
//             max={72}
//             step={1}
//             value={fontSettings[type].size}
//             onChange={(value) => handleFontChange(type, 'size', value)}
//           >
//             <SliderTrack>
//               <SliderFilledTrack />
//             </SliderTrack>
//             <SliderThumb />
//           </Slider>
//         </Box>
//       ))}
//     </VStack>
//   );
// };

const HomePage = ({
  user,
  credits,
  handleGoogleLogin,
  handleGenerate,
  url,
  setUrl,
  isLoading,
  error,
  infographics,
  handleDownload,
  // handleEdit
  handleViewInfographic
}) => {
  const navigate = useNavigate();

  return (
    <Flex flex={1} justify="center" align="center" direction="column">
      <Box width="100%" maxWidth="600px" p={4}>
        <Input
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          mb={4}
        />
        <Button
          onClick={handleGenerate}
          colorScheme="blue"
          isLoading={isLoading}
          loadingText="Generating..."
          width="100%"
          isDisabled={!user || isLoading || !url}
        >
          Generate
        </Button>

        <Divider my={8} />

        <Text textAlign="center" fontStyle={'italic'} my={6}>Don't have a Blog?</Text>

        <Button
          onClick={() => navigate('/generate-from-scratch')}
          colorScheme="green"
          width="100%"
        >
          Generate an Infographic from Scratch
        </Button>
      </Box>

      {error && (
        <Alert status="error" mb={4} maxWidth="600px">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {infographics.length > 0 && (
        <Box p={4} width="90%" margin="0 auto">
          <Grid
            templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
            gap={6}
          >
            {infographics.map((infographic, index) => (
              <Box key={index} borderWidth={1} borderRadius="md" p={4}>
                <Image
                  src={infographic.base64_image}
                  alt={`Infographic ${index + 1}`}
                  cursor="pointer"
                  mb={2}
                  onClick={() => handleViewInfographic(infographic)}
                />
                <HStack justifyContent="space-between">
                  <Button
                    onClick={() => handleDownload(infographic)}
                    colorScheme="green"
                    size="sm"
                    width="100%"
                  >
                    Download
                  </Button>
                  {/* <Button
                    onClick={() => handleEdit(infographic)}
                    colorScheme="blue"
                    size="sm"
                  >
                    Edit
                  </Button> */}
                </HStack>
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </Flex>
  );
};

// const GenerateFromScratch = ({ onCreditsUpdate }) => {
//   const [topic, setTopic] = useState('');
//   const [keywords, setKeywords] = useState([]);
//   const [currentKeyword, setCurrentKeyword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [scratchInfographics, setScratchInfographics] = useState([]);
//   const [editingInfographic, setEditingInfographic] = useState(null);
//   const [localCustomizations, setLocalCustomizations] = useState(null);
//   const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
//   const editImageRef = useRef(null);
//   const toast = useToast();

//   const handleAddKeyword = () => {
//     if (currentKeyword && !keywords.includes(currentKeyword)) {
//       setKeywords([...keywords, currentKeyword]);
//       setCurrentKeyword('');
//     }
//   };

//   const handleRemoveKeyword = (keywordToRemove) => {
//     setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
//   };

//   const handleGenerate = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('http://instagraphix.pro:5000/api/generate_from_scratch', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           topic: topic,
//           keywords: keywords,
//           num_steps: 3
//         }),
//         credentials: 'include'
//       });

//       if (!response.ok) {
//         throw new Error('Failed to generate infographic');
//       }

//       const data = await response.json();
      
//       // Fetch config files for each infographic
//       const infographicsWithConfig = await Promise.all(data.infographics.map(async (infographic) => {
//         const configResponse = await fetch(`http://instagraphix.pro:5000/api/get_config/${infographic.template_name}`);
//         if (!configResponse.ok) {
//           throw new Error(`Failed to fetch config for ${infographic.template_name}`);
//         }
//         const config = await configResponse.json();
//         return { ...infographic, config };
//       }));

//       setScratchInfographics(infographicsWithConfig);
      
//       if (onCreditsUpdate) {
//         onCreditsUpdate(data.remaining_credits);
//       }
      
//       toast({
//         title: "Infographic Generated",
//         description: "Your infographic has been successfully created.",
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//       });

//     } catch (error) {
//       console.error('Error generating infographic:', error);
//       toast({
//         title: "Error",
//         description: "Failed to generate infographic. Please try again.",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDownload = (infographic) => {
//     const link = document.createElement('a');
//     link.href = infographic.base64_image;
//     link.download = `infographic_${infographic.template_name}.png`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleEdit = (infographic) => {
//     if (!infographic.config || !infographic.config.fonts) {
//       console.error('Config or fonts not found for infographic:', infographic);
//       toast({
//         title: "Error",
//         description: "Unable to edit this infographic due to missing configuration.",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//       return;
//     }
  
//     const fontSettings = {
//       title: {
//         family: infographic.config.fonts.title[0],
//         size: infographic.config.fonts.title[1]
//       },
//       subtitle: {
//         family: infographic.config.fonts.subtitle[0],
//         size: infographic.config.fonts.subtitle[1]
//       },
//       body: {
//         family: infographic.config.fonts.body[0],
//         size: infographic.config.fonts.body[1]
//       }
//     };
  
//     setEditingInfographic(infographic);
//     setLocalCustomizations(fontSettings);
//     onEditOpen();
//   };

//   const handleLocalCustomizationUpdate = (newCustomizations) => {
//     setLocalCustomizations(newCustomizations);
//   };

//   const handleSaveCustomizations = async () => {
//     if (!editingInfographic || !localCustomizations) return;
  
//     setIsLoading(true);
//     try {
//       const response = await fetch('http://instagraphix.pro:5000/api/finalize_infographic', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           content_data: editingInfographic.content_data,
//           customizations: localCustomizations,
//           template_name: editingInfographic.template_name
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
  
//       const data = await response.json();
//       const updatedInfographic = {
//         ...editingInfographic,
//         base64_image: data.final_infographics[0].base64_image,
//         config: {
//           ...(editingInfographic.config || {}),
//           fonts: {
//             title: [localCustomizations.title.family, localCustomizations.title.size],
//             subtitle: [localCustomizations.subtitle.family, localCustomizations.subtitle.size],
//             body: [localCustomizations.body.family, localCustomizations.body.size]
//           }
//         }
//       };
  
//       setScratchInfographics(prevInfographics => 
//         prevInfographics.map(infographic => 
//           infographic.template_name === updatedInfographic.template_name ? updatedInfographic : infographic
//         )
//       );
  
//       setEditingInfographic(updatedInfographic);
//       onEditClose();
      
//       toast({
//         title: "Changes Saved",
//         description: "Your customizations have been successfully applied.",
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//       });
//     } catch (err) {
//       console.error('Failed to save customizations:', err);
//       toast({
//         title: "Error",
//         description: "Failed to save customizations. Please try again.",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Box minHeight="100vh" padding={4}>
//       <VStack spacing={6} width="100%" maxWidth="600px" margin="0 auto" mb={10}>
//         <Box width="100%">
//           <Flex alignItems="center" mb={2}>
//             <Text fontWeight="bold" mr={2}>Enter a Topic</Text>
//             <Tooltip label="Provide a brief description of the topic for which you want to generate an infographic">
//               <InfoIcon />
//             </Tooltip>
//           </Flex>
//           <Input
//             value={topic}
//             onChange={(e) => setTopic(e.target.value)}
//             placeholder="e.g., The benefits of regular exercise"
//           />
//         </Box>
        
//         <Box width="100%">
//           <Flex alignItems="center" mb={2}>
//             <Text fontWeight="bold" mr={2}>Keywords to Focus on (Optional)</Text>
//             <Tooltip label="Enter keywords that will be used in the metadata of the infographic. This will help with SEO and content focus.">
//               <InfoIcon />
//             </Tooltip>
//           </Flex>
//           <HStack>
//             <Input
//               placeholder="Add a keyword"
//               value={currentKeyword}
//               onChange={(e) => setCurrentKeyword(e.target.value)}
//               onKeyPress={(e) => {
//                 if (e.key === 'Enter') {
//                   handleAddKeyword();
//                 }
//               }}
//             />
//             <Button onClick={handleAddKeyword}>Add</Button>
//           </HStack>
//           <Flex flexWrap="wrap" mt={2}>
//             {keywords.map((keyword, index) => (
//               <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="blue" m={1}>
//                 <TagLabel>{keyword}</TagLabel>
//                 <TagCloseButton onClick={() => handleRemoveKeyword(keyword)} />
//               </Tag>
//             ))}
//           </Flex>
//         </Box>
        
//         <Button
//           onClick={handleGenerate}
//           colorScheme="blue"
//           width="100%"
//           isDisabled={!topic || isLoading}
//           isLoading={isLoading}
//           loadingText="Generating..."
//           mt={10}
//         >
//           Generate
//         </Button>
//       </VStack>

//       {scratchInfographics.length > 0 && (
//         <Box width="90%" margin="0 auto">
//           <Grid
//             templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
//             gap={6}
//           >
//             {scratchInfographics.map((infographic, index) => (
//               <Box key={index} borderWidth={1} borderRadius="md" p={4}>
//                 <Image
//                   src={infographic.base64_image}
//                   alt={`Infographic ${index + 1}`}
//                   cursor="pointer"
//                   mb={2}
//                   onClick={() => handleEdit(infographic)}
//                 />
//                 <HStack justifyContent="space-between">
//                   <Button
//                     onClick={() => handleDownload(infographic)}
//                     colorScheme="green"
//                     size="sm"
//                   >
//                     Download
//                   </Button>
//                   <Button
//                     onClick={() => handleEdit(infographic)}
//                     colorScheme="blue"
//                     size="sm"
//                   >
//                     Edit
//                   </Button>
//                 </HStack>
//               </Box>
//             ))}
//           </Grid>
//         </Box>
//       )}

//       {/* <Modal isOpen={isEditOpen} onClose={onEditClose} size="full">
//         <ModalOverlay />
//         <ModalContent maxWidth="100vw" height="100vh">
//           <ModalHeader>Edit Infographic</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody padding={0} display="flex" flexDirection="row">
//             <Box
//               flex={2}
//               overflowY="auto"
//               padding={4}
//               height="calc(100vh - 60px)"
//             >
//               <Image
//                 ref={editImageRef}
//                 src={editingInfographic?.base64_image}
//                 alt="Editing Infographic"
//                 maxWidth="100%"
//               />
//             </Box>
//             <Box
//               flex={1}
//               overflowY="auto"
//               padding={4}
//               borderLeft="1px solid"
//               borderColor="gray.200"
//               height="calc(100vh - 60px)"
//             >
//               {localCustomizations && (
//                 <EditMode
//                   initialSettings={localCustomizations}
//                   onUpdate={handleLocalCustomizationUpdate}
//                 />
//               )}
//             </Box>
//           </ModalBody>
//           <ModalFooter>
//             <Button
//               colorScheme="blue"
//               mr={3}
//               onClick={handleSaveCustomizations}
//               isLoading={isLoading}
//             >
//               Save Changes
//             </Button>
//             <Button variant="ghost" onClick={onEditClose}>
//               Cancel
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal> */}
//     </Box>
//   );
// };


const GenerateFromScratch = ({ onCreditsUpdate }) => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scratchInfographics, setScratchInfographics] = useState([]);
  const [viewingInfographic, setViewingInfographic] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const toast = useToast();

  const handleAddKeyword = () => {
    if (currentKeyword && !keywords.includes(currentKeyword)) {
      setKeywords([...keywords, currentKeyword]);
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://be-194431053746.us-central1.run.app/api/generate_from_scratch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          keywords: keywords,
          num_steps: 3
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate infographic');
      }

      const data = await response.json();
      
      // Fetch config files for each infographic
      const infographicsWithConfig = await Promise.all(data.infographics.map(async (infographic) => {
        const configResponse = await fetch(`https://be-194431053746.us-central1.run.app/api/get_config/${infographic.template_name}`);
        if (!configResponse.ok) {
          throw new Error(`Failed to fetch config for ${infographic.template_name}`);
        }
        const config = await configResponse.json();
        return { ...infographic, config };
      }));

      setScratchInfographics(infographicsWithConfig);
      
      if (onCreditsUpdate) {
        onCreditsUpdate(data.remaining_credits);
      }
      
      toast({
        title: "Infographic Generated",
        description: "Your infographic has been successfully created.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error generating infographic:', error);
      toast({
        title: "Error",
        description: "Failed to generate infographic. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (infographic) => {
    const link = document.createElement('a');
    link.href = infographic.base64_image;
    link.download = `infographic_${infographic.template_name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewInfographic = (infographic) => {
    setViewingInfographic(infographic);
    onViewOpen();
  };

  return (
    <Box minHeight="100vh" padding={4}>
      <VStack spacing={6} width="100%" maxWidth="600px" margin="0 auto" mb={10}>
        <Box width="100%">
          <Flex alignItems="center" mb={2}>
            <Text fontWeight="bold" mr={2}>Enter a Topic</Text>
            <Tooltip label="Provide a brief description of the topic for which you want to generate an infographic">
              <InfoIcon />
            </Tooltip>
          </Flex>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The benefits of regular exercise"
          />
        </Box>
        
        <Box width="100%">
          <Flex alignItems="center" mb={2}>
            <Text fontWeight="bold" mr={2}>Keywords to Focus on (Optional)</Text>
            <Tooltip label="Enter keywords that will be used in the metadata of the infographic. This will help with SEO and content focus.">
              <InfoIcon />
            </Tooltip>
          </Flex>
          <HStack>
            <Input
              placeholder="Add a keyword"
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddKeyword();
                }
              }}
            />
            <Button onClick={handleAddKeyword}>Add</Button>
          </HStack>
          <Flex flexWrap="wrap" mt={2}>
            {keywords.map((keyword, index) => (
              <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="blue" m={1}>
                <TagLabel>{keyword}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveKeyword(keyword)} />
              </Tag>
            ))}
          </Flex>
        </Box>
        
        <Button
          onClick={handleGenerate}
          colorScheme="blue"
          width="100%"
          isDisabled={!topic || isLoading}
          isLoading={isLoading}
          loadingText="Generating..."
          mt={10}
        >
          Generate
        </Button>
      </VStack>

      {scratchInfographics.length > 0 && (
        <Box width="90%" margin="0 auto">
          <Grid
            templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
            gap={6}
          >
            {scratchInfographics.map((infographic, index) => (
              <Box key={index} borderWidth={1} borderRadius="md" p={4}>
                <Image
                  src={infographic.base64_image}
                  alt={`Infographic ${index + 1}`}
                  cursor="pointer"
                  mb={2}
                  onClick={() => handleViewInfographic(infographic)}
                />
                <Button
                  onClick={() => handleDownload(infographic)}
                  colorScheme="green"
                  size="sm"
                  width="100%"
                >
                  Download
                </Button>
              </Box>
            ))}
          </Grid>
        </Box>
      )}

<Modal isOpen={isViewOpen} onClose={onViewClose} size="full">
        <ModalOverlay />
        <ModalContent maxWidth="60vw" height="100vh">
          {/* <ModalHeader>Edit Infographic</ModalHeader> */}
          <ModalCloseButton />
          <ModalBody padding={0} display="flex" flexDirection="row">
            <Box
              flex={2}
              overflowY="auto"
              padding={4}
              height="calc(100vh - 60px)"
            >
              <Image
                // ref={editImageRef}
                src={viewingInfographic?.base64_image}
                // alt="Editing Infographic"
                maxWidth="100%"
              />
            </Box>
            {/* <Box
              flex={1}
              overflowY="auto"
              padding={4}
              borderLeft="1px solid"
              borderColor="gray.200"
              height="calc(100vh - 60px)"
            > */}
              {/* {localCustomizations && (
                <EditMode
                  initialSettings={localCustomizations}
                  onUpdate={handleLocalCustomizationUpdate}
                />
              )} */}
            {/* </Box> */}
          </ModalBody>
          {/* <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSaveCustomizations}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
            <Button variant="ghost" onClick={onEditClose}>
              Cancel
            </Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>

    </Box>
  );
};


export { HomePage, GenerateFromScratch };


const UrlInput = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [infographics, setInfographics] = useState([]);
  const [error, setError] = useState('');
  const [editingInfographic, setEditingInfographic] = useState(null);
  const [localCustomizations, setLocalCustomizations] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isPricingModalOpen, onOpen: openPricingModal, onClose: closePricingModal } = useDisclosure();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const editImageRef = useRef(null);
  const [credits, setCredits] = useState(0);
  const [user, setUser] = useState(null);
  const sidebarRef = useRef(null);
  const toast = useToast();
  const [viewingInfographic, setViewingInfographic] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();


  const handlePurchaseCredits = () => {
    openPricingModal();
  };

  const handleCreditsUpdate = (newCredits) => {
    setCredits(newCredits);
  };

  const handleViewInfographic = (infographic) => {
    setViewingInfographic(infographic);
    onViewOpen();
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user`, {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setCredits(userData.credits);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/login/google`;
  };

  const handleLogout = () => {
    window.location.href = `${API_URL}/logout`;
  };  

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX <= 60) {
        setIsSidebarOpen(true);
      } else if (e.clientX > 200 && !sidebarRef.current?.contains(e.target)) {
        setIsSidebarOpen(false);
      }
    };

    const handleMouseLeave = (e) => {
      if (!sidebarRef.current?.contains(e.relatedTarget)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    sidebarRef.current?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      sidebarRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to generate infographics.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setIsLoading(true);
    setError('');
    setInfographics([]);
  
    try {
      const response = await fetch('https://be-194431053746.us-central1.run.app/api/generate_infographic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        credentials: 'include'
      });

      if (response.status === 403) {
        toast({
          title: 'Insufficient Credits',
          description: 'You are out of credits. Please purchase more to continue generating infographics.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Backend response:', data);
  
      if (data.error) {
        throw new Error(data.error);
      }
  
      const infographicsWithConfig = await Promise.all(data.infographics.map(async (infographic) => {
        const configResponse = await fetch(`https://be-194431053746.us-central1.run.app/api/get_config/${infographic.template_name}`);
        if (!configResponse.ok) {
          throw new Error(`Failed to fetch config for ${infographic.template_name}`);
        }
        const config = await configResponse.json();
        return { ...infographic, config };
      }));
  
      setInfographics(infographicsWithConfig);
      setCredits(data.remaining_credits);
      toast({
        title: 'Infographic Generated',
        description: 'Your infographic has been generated successfully.',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      setError('Failed to generate infographic: ' + err.message);
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (infographic) => {
    const link = document.createElement('a');
    link.href = infographic.base64_image;
    link.download = `infographic_${infographic.template_name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const handleEdit = (infographic) => {
  //   if (!infographic.config || !infographic.config.fonts) {
  //     console.error('Config or fonts not found for infographic:', infographic);
  //     setError('Unable to edit this infographic due to missing configuration.');
  //     return;
  //   }
  
  //   const fontSettings = {
  //     title: {
  //       family: infographic.config.fonts.title[0],
  //       size: infographic.config.fonts.title[1]
  //     },
  //     subtitle: {
  //       family: infographic.config.fonts.subtitle[0],
  //       size: infographic.config.fonts.subtitle[1]
  //     },
  //     body: {
  //       family: infographic.config.fonts.body[0],
  //       size: infographic.config.fonts.body[1]
  //     }
  //   };
  
  //   setEditingInfographic(infographic);
  //   setLocalCustomizations(fontSettings);
  //   onEditOpen();
  // }

  const handleLocalCustomizationUpdate = (newCustomizations) => {
    setLocalCustomizations(newCustomizations);
  };

  const handleSaveCustomizations = async () => {
    if (!editingInfographic || !localCustomizations) return;
  
    setIsLoading(true);
    try {
      const response = await fetch('https://be-194431053746.us-central1.run.app/api/finalize_infographic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_data: editingInfographic.content_data,
          customizations: localCustomizations,
          template_name: editingInfographic.template_name
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const updatedInfographic = {
        ...editingInfographic,
        base64_image: data.final_infographics[0].base64_image,
        config: {
          ...(editingInfographic.config || {}),
          fonts: {
            title: [localCustomizations.title.family, localCustomizations.title.size],
            subtitle: [localCustomizations.subtitle.family, localCustomizations.subtitle.size],
            body: [localCustomizations.body.family, localCustomizations.body.size]
          }
        }
      };
  
      setInfographics(prevInfographics => 
        prevInfographics.map(infographic => 
          infographic.template_name === updatedInfographic.template_name ? updatedInfographic : infographic
        )
      );
  
      setEditingInfographic(updatedInfographic);
      onEditClose();
    } catch (err) {
      console.error('Failed to save customizations:', err);
      setError('Failed to save customizations: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      // <Center height="100vh">
      //   <Button onClick={handleGoogleLogin} colorScheme="blue" size="lg">
      //     Login with Google!
      //   </Button>
      // </Center>
    <LandingPage handleGoogleLogin={handleGoogleLogin} />
    );
  }

  return (
    <Router>
      <Box position="relative" minHeight="100vh">
        <IconButton
          icon={<HamburgerIcon />}
          position="fixed"
          top={4}
          left={4}
          zIndex={2}
          onClick={() => setIsSidebarOpen(true)}
        />

        <Drawer
          placement="left"
          onClose={() => {}}
          isOpen={isSidebarOpen}
          size="xs"
        >
          <DrawerContent ref={sidebarRef}>
            <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
            <DrawerBody
              as={Flex}
              flexDirection="column"
              justifyContent="space-between"
              height="100%"
            >
              <VStack align="stretch" spacing={4} width="100%">
                <Link to="/">
                  <Flex
                    align="center"
                    justify="flex-start"
                    marginTop={20}
                    cursor="pointer"
                    
                  >
                    <Box
                      as="div"
                      py={2}
                      px={4}
                      borderRadius="md"
                      _hover={{
                        bg: "blue.500",
                        color: "white",
                      }}
                      transition="all 0.2s"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="40px"
                      width="100%"
                    >
                      <TriangleUpIcon mr={2}/>
                      <Text>Generate from Text</Text>
                    </Box>
                  </Flex>
                </Link>
                <Link to="/generate-from-scratch">
                  <Flex
                    align="center"
                    justify="center"
                    cursor="pointer"
                    py={2}
                    px={4}
                    borderRadius="md"
                    _hover={{
                      bg: "blue.500",
                      color: "white",
                    }}
                    transition="all 0.2s"
                  >
                    <AddIcon mr={2} />
                    <Text>Generate from Scratch</Text>
                  </Flex>
                </Link>
              </VStack>
              {user ? (
                <VStack spacing={4}>
                  <Text textAlign="center">Credits: {credits}</Text>
                  <Flex
                    align="center"
                    justify="flex-start"
                    cursor="pointer"
                    onClick={handlePurchaseCredits}
                    marginBottom="100px"
                  >
                    <Box
                      as="div"
                      py={2}
                      px={4}
                      borderRadius="md"
                      bg="green.500"
                      color="white"
                      _hover={{
                        bg: "green.600",
                      }}
                      transition="all 0.2s"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="40px"
                    >
                      <Text>Purchase Credits</Text>
                    </Box>
                  </Flex>
                  <Button onClick={handleLogout} colorScheme="red" width="100%">
                    Logout
                  </Button>
                </VStack>
              ) : (
                <Button onClick={handleGoogleLogin} colorScheme="blue">
                  Login with Google
                </Button>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Flex direction="column" minHeight="100%" pt={16}>
          <Routes>
            <Route path="/" element={
              <HomePage
                user={user}
                credits={credits}
                handleGoogleLogin={handleGoogleLogin}
                handleGenerate={handleGenerate}
                url={url}
                setUrl={setUrl}
                isLoading={isLoading}
                error={error}
                infographics={infographics}
                handleDownload={handleDownload}
                // handleEdit={handleEdit}
                handleViewInfographic={handleViewInfographic}
              />
            } />
            <Route path="/generate-from-scratch" element={
              <GenerateFromScratch onCreditsUpdate={handleCreditsUpdate} />
            } />
          </Routes>
        </Flex>
      </Box>

      <Modal isOpen={isViewOpen} onClose={onViewClose} size="full">
        <ModalOverlay />
        <ModalContent maxWidth="60vw" height="100vh">
          {/* <ModalHeader>Edit Infographic</ModalHeader> */}
          <ModalCloseButton />
          <ModalBody padding={0} display="flex" flexDirection="row">
            <Box
              flex={2}
              overflowY="auto"
              padding={4}
              height="calc(100vh - 60px)"
            >
              <Image
                ref={editImageRef}
                src={viewingInfographic?.base64_image}
                // alt="Editing Infographic"
                maxWidth="100%"
              />
            </Box>
            {/* <Box
              flex={1}
              overflowY="auto"
              padding={4}
              borderLeft="1px solid"
              borderColor="gray.200"
              height="calc(100vh - 60px)"
            > */}
              {/* {localCustomizations && (
                <EditMode
                  initialSettings={localCustomizations}
                  onUpdate={handleLocalCustomizationUpdate}
                />
              )} */}
            {/* </Box> */}
          </ModalBody>
          {/* <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSaveCustomizations}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
            <Button variant="ghost" onClick={onEditClose}>
              Cancel
            </Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={closePricingModal}
      />
    </Router>
  );
};

export default UrlInput;