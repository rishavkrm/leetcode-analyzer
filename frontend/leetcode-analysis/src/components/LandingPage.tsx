import { Button, Box, Text, Container, Card, SimpleGrid, ThemeIcon, Group, Stack, ActionIcon, rem } from '@mantine/core';
import { keyframes } from '@emotion/react';
import '@mantine/core/styles.css';
import { IconBulb, IconArrowRight, IconGraph, IconListCheck, IconCode, IconChartBar, IconBrandGithub } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const float = keyframes({
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-15px)' },
    '100%': { transform: 'translateY(0px)' },
});

const fadeIn = keyframes({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
});

// Stat box component for hero section
function StatBox({ value, label }: { value: string; label: string }) {
    return (
        <Box
            style={{
                textAlign: 'center',
                padding: '16px 24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <Text fw={700} size="xl" style={{ color: '#61DAFB' }}>{value}</Text>
            <Text size="xs" c="dimmed">{label}</Text>
        </Box>
    );
}

// Homepage/Landing page component
function LandingPage() {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
    }, []);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(35, 31, 25, 0.95), rgba(10, 11, 30, 0.95))',
        }}>
            <Box
                py={60}
                style={{
                    background: 'linear-gradient(135deg, rgba(25, 26, 35, 0.95), rgba(10, 11, 30, 0.95))',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '60px',
                }}
            >
                <Box
                    style={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(97, 218, 251, 0.2) 0%, rgba(97, 218, 251, 0) 70%)',
                        top: '-100px',
                        right: '-100px',
                        zIndex: 0,
                    }}
                />
                <Box
                    style={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(130, 87, 229, 0.2) 0%, rgba(130, 87, 229, 0) 70%)',
                        bottom: '-80px',
                        left: '15%',
                        zIndex: 0,
                    }}
                />

                {/* Code pattern background */}
                <Text
                    style={{
                        position: 'absolute',
                        fontSize: '10px',
                        color: 'rgba(255, 255, 255, 0.03)',
                        fontFamily: 'monospace',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        zIndex: 0,
                        padding: '20px',
                        whiteSpace: 'pre',
                        pointerEvents: 'none',
                    }}
                >
                    {`function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

class Solution {
  twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) {
        return [map.get(complement), i];
      }
      map.set(nums[i], i);
    }
  }
}`}
                </Text>

                <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
                    <Stack gap={50} align="center">
                        {/* Animated title */}
                        <Box ta="center" style={{
                            animation: `${visible ? `${fadeIn} 0.8s ease-out forwards` : 'none'}`,
                            opacity: visible ? 1 : 0
                        }}>
                            <Text
                                component="h1"
                                size="4rem"
                                fw={800}
                                style={{
                                    background: 'linear-gradient(135deg, #61DAFB, #8257E5)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    lineHeight: 1.1,
                                    marginBottom: '16px',
                                }}
                            >
                                AI-Powered LeetCode Analyzer
                            </Text>
                            <Text size="xl" c="gray.3" maw={600} mx="auto" mt={16} mb={30}>
                                Elevate your coding practice with AI-driven insights, solution comparisons, and intelligent revision tools
                            </Text>

                            <Group gap="md" justify="center" mt="xl">
                                <Button
                                    size="lg"
                                    px={30}
                                    onClick={() => navigate('/leetcode-submissions')}
                                    rightSection={<IconArrowRight size={18} />}
                                    variant="gradient"
                                    gradient={{ from: '#61DAFB', to: '#8257E5', deg: 90 }}
                                    style={{
                                        boxShadow: '0 8px 16px rgba(97, 218, 251, 0.3)',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    Analyze My Solutions
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    color="gray.5"
                                    leftSection={<IconCode size={18} />}
                                    onClick={() => navigate('/learning')}
                                >
                                    AI Learning Hub
                                </Button>
                            </Group>
                        </Box>

                        {/* Floating illustration */}
                        <Box
                            style={{
                                width: '240px',
                                height: '240px',
                                position: 'relative',
                                animation: `${float} 6s ease-in-out infinite`,
                            }}
                        >
                            <Box
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, #61DAFB20, #8257E520)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                                    transform: 'rotate(-6deg)',
                                    zIndex: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box p="sm" style={{ opacity: 0.9 }}>
                                    <Text size="xs" c="dimmed" mb={5}>Problem Stats:</Text>
                                    <Box style={{ width: '80%', height: '8px', background: 'rgba(97, 218, 251, 0.3)', borderRadius: '4px', marginBottom: '8px' }} />
                                    <Box style={{ width: '60%', height: '8px', background: 'rgba(130, 87, 229, 0.3)', borderRadius: '4px', marginBottom: '16px' }} />
                                    <Text size="xs" c="dimmed" mb={5}>Weekly Progress:</Text>
                                    <SimpleGrid cols={7}>
                                        {[0.3, 0.5, 0.2, 0.8, 0.6, 0.4, 0.7].map((height, i) => (
                                            <Box
                                                key={i}
                                                style={{
                                                    height: '60px',
                                                    display: 'flex',
                                                    alignItems: 'flex-end',
                                                }}
                                            >
                                                <Box
                                                    style={{
                                                        width: '100%',
                                                        height: `${height * 100}%`,
                                                        background: `rgba(${i % 2 ? '97, 218, 251' : '130, 87, 229'}, 0.5)`,
                                                        borderRadius: '2px',
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </SimpleGrid>
                                </Box>
                            </Box>
                            <Box
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '24px',
                                    background: 'linear-gradient(135deg, #8257E520, #61DAFB20)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                                    transform: 'rotate(6deg)',
                                    right: '-20px',
                                    top: '20px',
                                    zIndex: 0,
                                }}
                            />
                        </Box>

                        {/* Stats */}
                        <Group gap="md" style={{
                            width: '100%',
                            justifyContent: 'center',
                            animation: `${visible ? `${fadeIn} 1s ease-out 0.3s forwards` : 'none'}`,
                            opacity: visible ? 1 : 0
                        }}>
                            <StatBox value="500+" label="AI-ANALYZED PROBLEMS" />
                            <StatBox value="85%" label="OPTIMIZATION RATE" />
                            <StatBox value="10x" label="LEARNING EFFICIENCY" />
                        </Group>
                    </Stack>
                </Container>
            </Box>

            {/* Features Section */}
            <Box mb={80} style={{
                animation: `${visible ? `${fadeIn} 1s ease-out 0.6s forwards` : 'none'}`,
                opacity: visible ? 1 : 0,
                padding: "25px"
            }}>
                <Text
                    ta="center"
                    size="xl"
                    fw={700}
                    mb={60}
                    style={{
                        fontSize: '2.2rem',
                        background: 'linear-gradient(90deg, #61DAFB, #8257E5)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Supercharge Your LeetCode Practice
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                    <FeatureCard
                        icon={<IconGraph stroke={1.5} />}
                        title="AI-Generated Performance Analytics"
                        description="Track your submission history with AI-powered performance metrics"
                        color="#61DAFB"
                    />
                    <FeatureCard
                        icon={<IconListCheck stroke={1.5} />}
                        title="Personalized Revision Lists"
                        description="Create your own personalized revision schedules based on AI analysis of your performance patterns"
                        color="#8257E5"
                    />
                    <FeatureCard
                        icon={<IconBulb stroke={1.5} />}
                        title="Learning Recommendations"
                        description="Receive learning materials tailored to your specific improvement areas"
                        color="#F2994A"
                    />
                    <FeatureCard
                        icon={<IconChartBar stroke={1.5} />}
                        title="Deep Learning Analysis"
                        description="AI examines your code to identify strengths, weaknesses, and optimal solution patterns"
                        color="#6FCF97"
                    />
                    <FeatureCard
                        icon={<IconCode stroke={1.5} />}
                        title="Solution Comparison"
                        description="AI compares your solutions with optimal approaches, highlighting key differences and improvements"
                        color="#BB6BD9"
                    />
                    <FeatureCard
                        icon={<IconArrowRight stroke={1.5} />}
                        title="Smart Revision System"
                        description="AI tracks which problems you need to revisit based on your confidence level and solution quality"
                        color="#EB5757"
                    />
                </SimpleGrid>
            </Box>
            <Box mb={80} style={{
                animation: `${visible ? `${fadeIn} 1s ease-out 0.8s forwards` : 'none'}`,
                opacity: visible ? 1 : 0,
                padding: "40px 25px",
                background: 'linear-gradient(135deg, rgba(25, 26, 35, 0.98), rgba(10, 11, 30, 0.98))',
                borderRadius: "8px",
            }}>
                <Text
                    ta="center"
                    size="xl"
                    fw={700}
                    mb={40}
                    style={{
                        fontSize: '2rem',
                        background: 'linear-gradient(90deg, #61DAFB, #8257E5)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    How Our AI Powers Your LeetCode Journey
                </Text>

                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                    <Card
                        shadow="sm"
                        padding="xl"
                        radius="lg"
                        withBorder
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Text fw={700} size="lg" mb={12} style={{ color: '#61DAFB' }}>1. Deep Code Analysis</Text>
                        <Text size="sm" c="dimmed" lh={1.6}>
                            We analyze your code structure, algorithm choice, and implementation details to identify optimization opportunities.
                        </Text>
                    </Card>

                    <Card
                        shadow="sm"
                        padding="xl"
                        radius="lg"
                        withBorder
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Text fw={700} size="lg" mb={12} style={{ color: '#8257E5' }}>2. Solution Comparison</Text>
                        <Text size="sm" c="dimmed" lh={1.6}>
                            Compare your solutions with optimal approaches, with side-by-side diff views and detailed explanations of improvements.
                        </Text>
                    </Card>

                    <Card
                        shadow="sm"
                        padding="xl"
                        radius="lg"
                        withBorder
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Text fw={700} size="lg" mb={12} style={{ color: '#F2994A' }}>3. Smart Revision System</Text>
                        <Text size="sm" c="dimmed" lh={1.6}>
                            We evaluate which problems you should revisit based on your performance, solution quality, and custom confidence ratings.
                        </Text>
                    </Card>
                </SimpleGrid>
            </Box>
            {/* Footer */}
            {/* <Divider my={40} /> */}
            <Group justify="space-between" align="center" p={20}>
                <Text size="sm" c="dimmed">© 2025 LeetCode Analyzer. All rights reserved.</Text>
                <Group gap="sm">
                    <ActionIcon variant="subtle" color="gray" radius="xl" size="lg">
                        <IconBrandGithub style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                    </ActionIcon>
                </Group>
            </Group>
        </div>
    );
}

// Feature card component for the landing page
function FeatureCard({
    icon,
    title,
    description,
    color = '#61DAFB'
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color?: string;
}) {
    return (
        <Card
            shadow="sm"
            padding="xl"
            radius="lg"
            withBorder
            style={{
                borderColor: 'rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
                }
            }}
        >
            <ThemeIcon
                size={60}
                radius="md"
                style={{
                    background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                    border: `2px solid ${color}40`,
                    marginBottom: '1.5rem',
                }}
            >
                {icon}
            </ThemeIcon>
            <Text fw={700} size="lg" mb={8} style={{ color: color }}>{title}</Text>
            <Text size="sm" c="dimmed" lh={1.6}>{description}</Text>
        </Card>
    );
}

export default LandingPage;