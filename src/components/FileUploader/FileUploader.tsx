import React, { CSSProperties } from 'react'
import { DropzoneOptions, FileRejection, useDropzone } from 'react-dropzone'

import { useLocale } from '../../i18n'
import { focusBoxShadow, Theme, useStyles } from '../../styles'
import { format } from '../../util/byte'
import { HFlow } from '../HFlow'
import { Icon } from '../Icon/Icon'
import { Progress } from '../Progress/Progress'
import { Text } from '../Text'

export interface FileUploaderProps extends DropzoneOptions {
  file?: FileProps

  /**
   * @default "Click or drag files here to upload", from the locale strings
   */
  text?: string

  /**
   * Lists the files that were not added, such as too large ones, with the reason
   * @default true
   */
  showRejections?: boolean
}

export interface FileProps {
  error?: boolean
  progress?: number
  selectedFile?: File
  uploading?: boolean
}

export function FileUploader(props: FileUploaderProps) {
  const { file, text, showRejections = true, ...rest } = props
  const { classes, css } = useStyles(createStyles)
  const locale = useLocale()
  const { getRootProps, getInputProps, isDragActive, isDragAccept, fileRejections } = useDropzone(rest)

  // Says why each file was not added, in the words of the locale strings
  const reasonOf = (rejection: FileRejection) => {
    const codes = rejection.errors.map((error) => error.code)
    if (codes.includes('file-too-large') && props.maxSize) {
      return locale.fileUploader.tooLarge.replace('{size}', format(props.maxSize, 0))
    }
    if (codes.includes('file-invalid-type')) {
      return locale.fileUploader.wrongType
    }
    if (codes.includes('too-many-files')) {
      return locale.fileUploader.tooMany
    }
    return rejection.errors.map((error) => error.message).join('. ')
  }

  return (
    <>
      <div className={css(classes.componentWrapper, isDragActive && classes.dragBackground)} {...getRootProps()}>
        <input {...getInputProps()} />
        <div className={css(classes.buttonWrapper, props.disabled && classes.disabled)}>
          <div className={css(classes.dropzone, isDragActive && classes.dragActive)}>
            {isDragAccept}
            <HFlow justifyContent='center' alignItems='center' hSpacing={0.5}>
              <Icon fill={props.disabled ? 'disabled' : 'secondary'} icon='upload' />
              <Text color={props.disabled ? 'disabled' : 'secondary'} fontSize={0.875} fontWeight='bold'>
                {text ?? locale.fileUploader.text}
              </Text>
            </HFlow>
          </div>
        </div>
      </div>
      {file && <FileDetails file={file} />}
      {showRejections && fileRejections.length > 0 && (
        <ul role='alert' className={classes.rejections}>
          {fileRejections.map((rejection, index) => (
            <li key={`${rejection.file.name}-${index}`}>
              <Icon icon='exclamationTriangleOutline' size={1} style={classes.rejectionIcon} />
              <span>
                <strong>{rejection.file.name}</strong> · {locale.fileUploader.rejected}: {reasonOf(rejection)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export interface FileDetailsProps {
  file: FileProps
}

export function FileDetails(props: FileDetailsProps) {
  const { file } = props
  const { css, classes } = useStyles(createStyles)

  const returnExtension = () => {
    const { type } = file.selectedFile
    const typeSplit = type.split('/')
    if (typeSplit.length > 1) {
      return typeSplit[1]
    } else if (!typeSplit[0]) {
      return null
    } else {
      return typeSplit[0]
    }
  }

  return (
    <div className={css(classes.file, classes.fileDetailsContainer)}>
      <FileExtension extension={returnExtension()} />
      <div className={classes.fileDetails}>
        <FileInfo file={file} />
        {file.uploading && <Progress value={file.progress} />}
      </div>
    </div>
  )
}

export interface FileInfoProps {
  file: FileProps
}

export function FileInfo(props: FileInfoProps) {
  const { file } = props
  const { classes } = useStyles(createStyles)

  return (
    <div className={classes.fileDetailsContainer}>
      {!file.error && !file.uploading && (
        <Icon icon='checkDefault' fill='primary' size={1} style={{ marginRight: 5 }} />
      )}
      <Text fontWeight='bold' style={classes.fileName}>
        {file.selectedFile.name}
      </Text>
      <Text>{format(file.selectedFile.size, 0)}</Text>
    </div>
  )
}

export interface FileExtensionProps {
  extension: string
}

export function FileExtension(props: FileExtensionProps) {
  const { extension } = props
  const { classes } = useStyles((theme: Theme) => ({
    root: {
      backgroundColor: theme.pallete.surface.background,
      border: `1px solid ${theme.pallete.divider}`,
      padding: '1rem',
    },
  }))

  return (
    <Text color='secondary' style={classes.root} fontWeight='bold'>
      {extension}
    </Text>
  )
}

export const createStyles = (theme: Theme) => ({
  componentWrapper: {
    borderRadius: theme.radius.paper,
    backgroundColor: theme.pallete.surface.main,
    transition: 'box-shadow .2s ease',

    '&:focus': {
      outline: 'none',
      position: 'relative',
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  buttonWrapper: {
    border: `1px solid` + theme.pallete.gray.c40,
    borderRadius: theme.radius.paper,
    cursor: 'pointer',
    padding: '0.25em',
  } as CSSProperties,
  dropzone: {
    border: `1px dashed transparent`,
    borderRadius: theme.radius.paper,
    padding: '0.52em',
  } as CSSProperties,
  dragBackground: {
    backgroundColor: theme.pallete.surface.background,
  } as CSSProperties,
  dragActive: {
    border: `1px dashed` + theme.pallete.gray.c40,
  } as CSSProperties,
  disabled: {
    border: `1px solid` + theme.pallete.gray.c80,
    cursor: 'not-allowed',
  } as CSSProperties,
  file: {
    borderRadius: theme.radius.paper,
    borderBottom: '1px solid ' + theme.pallete.gray.c80,
    borderLeft: '1px solid ' + theme.pallete.gray.c80,
    borderRight: '1px solid ' + theme.pallete.gray.c80,
    padding: '1rem',
  },
  fileDetailsContainer: {
    backgroundColor: theme.pallete.surface.main,
    alignItems: 'center',
    display: 'flex',
  },
  fileDetails: {
    flexGrow: 1,
    marginLeft: '1rem',
  },
  rejections: {
    listStyle: 'none',
    margin: '0.5rem 0 0',
    padding: 0,
    color: theme.pallete.status.danger.main,
    '& li': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      padding: '0.25rem 0',
      overflowWrap: 'anywhere',
    },
  } as CSSProperties,
  rejectionIcon: {
    flexShrink: 0,
    marginTop: '0.125rem',
  } as CSSProperties,
  fileName: {
    wordBreak: 'break-all',
    marginRight: 10,
  } as CSSProperties,
})
