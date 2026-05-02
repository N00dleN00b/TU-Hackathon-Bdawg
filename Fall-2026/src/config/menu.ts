import {
    Home,
    ScanText,
    History,
    BookOpen,
    LucideIcon
} from 'lucide-react'

type MenuItemType = {
    title: string
    url: string
    external?: string
    icon?: LucideIcon
    items?: MenuItemType[]
}
type MenuType = MenuItemType[]

export const mainMenu: MenuType = [
    {
        title: 'Home',
        url: '/',
        icon: Home
    },
    {
        title: 'Analyze',
        url: '/analyze',
        icon: ScanText,
    },
    {
        title: 'History',
        url: '/history',
        icon: History,
    },
    {
        title: 'Learn',
        url: '/learn',
        icon: BookOpen,
    },
]
