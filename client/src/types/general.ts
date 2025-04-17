import { ReactNode } from 'react';

export enum PERMISSION {
    User = 'user',
    Admin = 'admin'
}

export enum VISIBILITY {
    PUBLIC = 'public',
    PRIVATE = 'private'
}

export enum LS_KEYS {
    token = 'chatbot-template-webapp-token'
}

export enum API_STATUS {
    OK = 200,

    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    PAYLOAD_TOO_LARGE = 413,
    UNSUPPORTED_MEDIA_TYPE = 415,
    TOO_MANY_REQUESTS = 429,

    INTERNAL_SERVER_ERROR = 500
}

export interface APIError {
    status: API_STATUS,
    message: string
}

export enum SidebarNodeType {
    Link = 'LINK',
    Button = 'BUTTON',
    Parent = 'PARENT'
}

export interface SidebarNodeLinkProps {
    type: SidebarNodeType.Link,
    link: string,
    icon?: ReactNode
}

export interface SidebarNodeButtonProps {
    type: SidebarNodeType.Button,
    onClick: () => void
    disabled?: boolean,
    icon?: ReactNode
}

export interface SidebarNodeParentProps {
    type: SidebarNodeType.Parent,
    children: SidebarNode[],
    additionalProps?: (
        SidebarNodeLinkProps | 
        SidebarNodeButtonProps
    ),
    icon: ReactNode
}

export interface SidebarNode {
    name: string;
    props: (
        SidebarNodeLinkProps | 
        SidebarNodeButtonProps | 
        SidebarNodeParentProps 
    )
}

export interface BreadcrumbType {
    name: string;
    isLink: boolean;
    link?: string;
}