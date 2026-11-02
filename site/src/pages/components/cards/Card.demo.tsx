import {
  Button,
  Card,
  ClickableCard,
  Heading,
  HFlow,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
  VFlow,
} from '@lemonade/ui'
import React, { useState } from 'react'

function CardDemo() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <VFlow vSpacing={0.5}>
        <Card>
          <VFlow vSpacing={0.5}>
            <VFlow vSpacing={0.25}>
              <Heading level={3} variant='h4'>
                Read-only card
              </Heading>
              <Text>Communicates something and can hold a call to action.</Text>
            </VFlow>
            <HFlow>
              <Button size='small'>Call to action</Button>
            </HFlow>
          </VFlow>
        </Card>
        <ClickableCard onClick={() => setOpen(true)}>
          <VFlow vSpacing={0.25}>
            <Text variant='h4'>Clickable card</Text>
            <Text>The whole card is the click area.</Text>
          </VFlow>
        </ClickableCard>
      </VFlow>

      <Modal size='small' open={open} onClose={close}>
        <ModalHeader title='Clickable card' />
        <ModalBody>
          <Text component='p'>
            The click on the card opened this dialog. A clickable card usually takes the user to the details of what it
            shows.
          </Text>
        </ModalBody>
        <ModalFooter>
          <HFlow justifyContent='flex-end'>
            <Button kind='primary' onClick={close}>
              Close
            </Button>
          </HFlow>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default CardDemo
