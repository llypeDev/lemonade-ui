import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Text, useDisclosure } from '@lemonade/ui'
import React from 'react'

function UseDisclosureDemo() {
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Edit profile</Button>
      <Modal open={open} onClose={onClose} size='small'>
        <ModalHeader title='Edit profile' />
        <ModalBody>
          <Text>The modal opens and closes with the functions of the hook.</Text>
        </ModalBody>
        <ModalFooter>
          <Button kind='primary' onClick={onClose}>
            Done
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default UseDisclosureDemo
