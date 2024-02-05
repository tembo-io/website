import fs from 'fs'


export async function GET(context) {
    const file = fs.readFileSync('./src/pages/blog/atom.xml', 'utf8')
    return new Response(
        file
    )
}
