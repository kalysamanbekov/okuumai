import React from 'react';
import { Box, Flex, Text, Button, Card, Heading } from '@radix-ui/themes';

const RadixDemo = () => {
  return (
    <Box p="4">
      <Card>
        <Flex direction="column" gap="3" p="4">
          <Heading size="5">Radix UI Demo</Heading>
          <Text>
            Это демонстрация компонентов Radix UI. Вы должны видеть стилизованные компоненты,
            если библиотека подключена правильно.
          </Text>
          <Flex gap="3">
            <Button>Обычная кнопка</Button>
            <Button variant="soft" color="orange">Оранжевая кнопка</Button>
            <Button variant="outline">Кнопка с контуром</Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};

export default RadixDemo;
